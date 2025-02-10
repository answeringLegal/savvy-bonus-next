import { NextRequest, NextResponse } from 'next/server';
import { parse, ParseResult } from 'papaparse';
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {
  format,
  parse as parseDate,
  isWithinInterval,
  startOfQuarter,
  endOfQuarter,
  subDays,
  addDays,
  isAfter,
  differenceInDays,
} from 'date-fns';

// Initialize Firebase directly in the route file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface COPayment {
  'Customer #': string;
  Customer: string;
  'State/Province': string;
  'Type of Law': string;
  LTV: string;
  Created: string; // format: "Feb 11, 2015 at 12:00:00 AM"
  'First Payment': string; // format: "Feb 11, 2015",
  Status: string;
  Total: string;
  'Admin User': string; // Sales Rep
  'Support Member': string;
  Lead: string;
  'Customer ID': string;
  'Source/Medium (Marketing)': string;
  'Ads?': string;
  'Invoiced This Month': string;
}

interface TransactionData {
  id: string;
  quarter_key: string;
  first_payment: Date;
  status: string;
  status_history: StatusHistory[];
  bonus_eligible: boolean;
  last_updated: Date;
  metadata: {
    customer: string;
    state: string;
    type_of_law: string;
    ltv: string;
    created: string;
    total: string;
    sales_rep: string;
    support_member: string;
    lead_source: string;
    source_medium: string;
    ads: string;
    invoiced_this_month: string;
  };
}

export type StatusHistory = {
  status: string;
  timestamp: Timestamp;
};

export async function POST(request: NextRequest) {
  try {
    if (
      !request.headers.get('Authorization') ||
      request.headers.get('Authorization') !==
        `Bearer ${process.env.ZAPIER_WEBHOOK_TOKEN}`
    ) {
      console.error(
        'Unauthorized request:',
        request.headers.get('Authorization')
      );
      return NextResponse.json({ error: 'Unauthorized', status: 401 });
    }
    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ignore if file is not a CSV
    if (!file.type.includes('csv')) {
      console.log('Processing file:', file.type, file.size, file.name);
      return NextResponse.json(
        {
          error: 'Invalid file type',
          details: 'Please upload a CSV file',
        },
        { status: 200 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // convert to json
    const parsedData = parse<COPayment>(buffer.toString(), {
      header: true,
      skipEmptyLines: true,
    });

    // Save the data to Firestore using Promise.all
    await saveDataToFirestore(parsedData);

    // Return success response with file details
    return NextResponse.json(
      {
        success: true,
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: parsedData.data.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        error: 'File upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

const saveDataToFirestore = async (parsedData: ParseResult<COPayment>) => {
  const currentStartOfQuarter = startOfQuarter(new Date());
  const currentEndOfQuarter = endOfQuarter(new Date());
  const transactions = parsedData.data;

  console.log('Processing transactions:', transactions.length);

  // filter out transactions that are not within the current quarter
  const transactionsInCurrentQuarter = transactions.filter((transaction) => {
    const firstPaymentDate = parseDate(
      transaction['First Payment'],
      'MMM d, yyyy',
      new Date()
    );

    console.log('firstPaymentDate', firstPaymentDate);

    return isWithinInterval(firstPaymentDate, {
      start: currentStartOfQuarter,
      end: currentEndOfQuarter,
    });
  });

  console.log(
    'Processing transactions in current quarter:',
    transactionsInCurrentQuarter.length
  );

  for (const transaction of transactionsInCurrentQuarter) {
    try {
      // Parse the First Payment date
      const firstPaymentDate = parseDate(
        transaction['First Payment'],
        'MMM d, yyyy',
        new Date()
      );

      if (isNaN(firstPaymentDate.getTime())) {
        console.warn(
          `Skipping invalid date for transaction: ${transaction['Customer #']}`
        );
        continue;
      }

      // Determine the quarter-year key (e.g., "Q4_2024")
      const quarterStart = startOfQuarter(firstPaymentDate);
      const quarterEnd = endOfQuarter(firstPaymentDate);
      const year = format(firstPaymentDate, 'yyyy');
      const quarter = format(firstPaymentDate, 'QQQ');
      const quarterKey = `${quarter}_${year}`;

      // Reference Firestore Document
      const transactionRef = doc(
        db,
        `transactions/${quarterKey}/records`,
        transaction['Customer #']
      ).withConverter({
        toFirestore: (data: TransactionData) => data,
        fromFirestore: (snapshot) => snapshot.data() as TransactionData,
      });
      const transactionSnap = await getDoc(transactionRef);
      let existingTransaction = transactionSnap.exists()
        ? transactionSnap.data()
        : null;

      // Backfill status history
      let statusHistory = existingTransaction?.status_history || [];

      const isTransactionStatusChanged =
        existingTransaction?.status !== transaction.Status;

      // if (!isTransactionStatusChanged) {
      //   // if the status has not changed, skip the transaction
      //   continue;
      // }

      if (!existingTransaction) {
        // add the first status history entry as a starting point
        statusHistory.push({
          status: transaction.Status,
          timestamp: Timestamp.fromDate(firstPaymentDate),
        });

        // if current date is past the quarter the transaction happened in, add a status history entry for the end of the quarter
        if (isAfter(new Date(), quarterEnd)) {
          statusHistory.push({
            status: transaction.Status,
            timestamp: Timestamp.fromDate(
              addDays(endOfQuarter(firstPaymentDate), 30)
            ),
          });
        } else {
          // use today's date
          statusHistory.push({
            status: transaction.Status,
            timestamp: Timestamp.fromDate(new Date()),
          });
        }
      } else {
        // if the status has changed, add a new status history entry
        if (isTransactionStatusChanged) {
          console.log(
            `Well, well, well, a transaction status has changed from ${existingTransaction.status} to ${transaction.Status}`
          );
          statusHistory.push({
            status: transaction.Status,
            timestamp: Timestamp.fromDate(new Date()),
          });
        }
      }

      // **Sort Status History Before Processing**
      statusHistory = statusHistory.sort((a, b) =>
        a.timestamp > b.timestamp ? 1 : -1
      );

      // **Determine Bonus Eligibility**
      let isBonusEligible = false;

      // We use this pointer to track the start of the "Current" period
      /*
        ========================================
        | Status | Timestamp | lastCurrentStart | currentStatus | nextStatus | daysInCurrent | isBonusEligible |
        ========================================
        | Current | 2024-03-01 | null | 2024-03-01 | 2024-03-31 | 30 | true |
        ========================================
        | Current | 2024-03-01 | null | 2024-03-01 | 2024-03-30 | 29 | false |
      */
      let lastCurrentStart: Timestamp | null = null;

      for (let i = 0; i < statusHistory.length; i++) {
        const currentStatus = statusHistory[i];
        const nextStatus = statusHistory[i + 1];
        // early check if the window of current status is greater than 30 days
        if (
          currentStatus.status === 'Current' &&
          nextStatus &&
          nextStatus.status === 'Current'
        ) {
          console.log(
            'comparing current status and next status',
            currentStatus,
            nextStatus
          );
          const daysInCurrent = differenceInDays(
            nextStatus.timestamp.toDate(),
            currentStatus.timestamp.toDate()
          );

          if (daysInCurrent >= 30) {
            isBonusEligible = true;
            break;
          }

          lastCurrentStart = null; // Reset tracking
        }

        // Start tracking "Current" period
        if (currentStatus.status === 'Current' && !lastCurrentStart) {
          lastCurrentStart = currentStatus.timestamp;
        }

        // If status changes, check how long "Current" lasted
        if (lastCurrentStart && nextStatus && nextStatus.status !== 'Current') {
          console.log(
            'lastCurrentStart && nextStatus && nextStatus.status !== Current',
            lastCurrentStart && nextStatus && nextStatus.status !== 'Current'
          );

          const daysInCurrent = differenceInDays(
            nextStatus.timestamp.toDate(),
            lastCurrentStart.toDate()
          );

          if (daysInCurrent >= 30) {
            isBonusEligible = true;
            break;
          }

          lastCurrentStart = null; // Reset tracking
        }
      }

      // **Final Check: If still "Current" at the last entry, check against competion end date**
      if (lastCurrentStart) {
        console.log('last check block: lastCurrentStart', lastCurrentStart);
        const competitionWindow = subDays(quarterEnd, 30);

        // the competion window date would only be applicable if the current date is past the quarter end date (i.e., when backfilling)
        // for all other cases we will check the difference between the last "Current" status date and the current date

        const lastTrackedDate = isAfter(new Date(), competitionWindow)
          ? competitionWindow
          : new Date();

        const daysInFinalCurrent = differenceInDays(
          lastTrackedDate,
          lastCurrentStart.toDate()
        );

        if (daysInFinalCurrent >= 30) {
          isBonusEligible = true;
        }
      }

      // Firestore Document Data
      const transactionData: TransactionData = {
        id: transaction['Customer #'],
        quarter_key: quarterKey,
        first_payment: firstPaymentDate,
        status: transaction.Status,
        status_history: statusHistory,
        bonus_eligible: isBonusEligible,
        last_updated: new Date(),
        metadata: {
          customer: transaction.Customer,
          state: transaction['State/Province'],
          type_of_law: transaction['Type of Law'],
          ltv: transaction.LTV,
          created: transaction.Created,
          total: transaction.Total,
          sales_rep: transaction['Admin User'],
          support_member: transaction['Support Member'],
          lead_source: transaction.Lead,
          source_medium: transaction['Source/Medium (Marketing)'],
          ads: transaction['Ads?'],
          invoiced_this_month: transaction['Invoiced This Month'],
        },
      };

      // Save or update Firestore document
      if (existingTransaction) {
        await updateDoc(transactionRef, transactionData);
      } else {
        await setDoc(transactionRef, transactionData);
      }

      console.log(`Saved transaction: ${transaction['Customer #']}`);
    } catch (error) {
      console.error(
        `Error saving transaction ${transaction['Customer #']}:`,
        error
      );
    }
  }
};
