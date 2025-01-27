// import { getDb } from '@/app/actions/dbInit';
// import { Setting } from '@/hooks/settings/useSettings';

// export async function GET(
//   req: Request,
//   params: {
//     name: string;
//   },
//   res: Response
// ) {
//   console.log('params', params);
//   try {
//     const db = await getDb();
//     const query = 'SELECT * FROM general_settings WHERE name = ?';
//     const result = await db.get<Setting>(query, `'${params.name}'`);

//     console.log('result', result);

//     return Response.json(
//       {},
//       {
//         status: 200,
//       }
//     );
//   } catch (error: any) {
//     console.error('an error occured', error);
//     return Response.json(error, {
//       status: 500,
//     });
//   }
// }
