import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { parse, ParseResult } from 'papaparse';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
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

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
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
          data: parsedData.data,
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
      { status: 500 }
    );
  }
}

// const saveDataToFirestore = async (parsedData: ParseResult<COPayment>) => {
//   const DB_KEY = 'bonus_deals';

//   console.log('Saving data to Firestore db:', db);
//   console.log('Parsed data:', parsedData);
//   try {
//     await Promise.all(
//       parsedData.data.map(async (data) => {
//         try {
//           const docRef = await addDoc(collection(db, DB_KEY), data);
//           console.log('Document written with ID: ', docRef.id);
//         } catch (e) {
//           console.error('Error adding document: ', e);
//         }
//       })
//     );
//   } catch (e) {
//     console.error('Error in Promise.all: ', e);
//   }
// };

const saveDataToFirestore = async (parsedData: ParseResult<COPayment>) => {
  const transactions = parsedData.data;

  for (const transaction of transactions) {
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

      // Determine the quarter-year key (e.g., "Q4_2025")
      const quarterStart = startOfQuarter(firstPaymentDate);
      const quarterEnd = endOfQuarter(firstPaymentDate);
      const year = format(firstPaymentDate, 'yyyy');
      const quarter = format(firstPaymentDate, 'QQQ');
      const quarterKey = `${quarter}_${year}`;

      // Create the Firestore document reference
      const transactionRef = doc(
        db,
        `transactions/${quarterKey}/records`,
        transaction['Customer #']
      );

      // Fetch existing transaction (if any)
      const transactionSnap = await getDoc(transactionRef);
      let existingTransaction = transactionSnap.exists()
        ? transactionSnap.data()
        : null;

      // Calculate if the transaction is bonus-eligible
      const isBonusEligible =
        transaction.Status === 'Current' &&
        isWithinInterval(firstPaymentDate, {
          start: subDays(firstPaymentDate, 30),
          end: quarterEnd,
        });

      // Track status history
      const statusHistory = existingTransaction?.status_history || [];
      if (
        !existingTransaction ||
        existingTransaction.status !== transaction.Status
      ) {
        statusHistory.push({
          status: transaction.Status,
          timestamp: new Date(),
        });
      }

      // Prepare Firestore document data
      const transactionData = {
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

      // Save or update transaction in Firestore
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
