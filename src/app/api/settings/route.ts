import { getDb } from '@/app/actions/dbInit';
import { Setting } from '@/hooks/settings/useSettings';

export async function GET(req: Request, res: Response) {
  try {
    const db = await getDb();
    const query = 'SELECT * FROM general_settings';
    const result = await db.all<Setting>(query);

    return Response.json(result, {
      status: 200,
    });
  } catch (error: any) {
    console.error('an error occured', error);
    return Response.json(error, {
      status: 500,
    });
  }
}

export async function POST(req: Request, res: Response) {
  try {
    const db = await getDb();
    const { name, value } = (await req.json()) as Setting;
    const query = 'INSERT INTO general_settings (name, value) VALUES (?, ?)';
    const result = await db.run(query, [name, value]);

    return Response.json(result, {
      status: 200,
    });
  } catch (error: any) {
    console.error('an error occured', error);
    return Response.json(error, {
      status: 500,
    });
  }
}

export async function PUT(req: Request, res: Response) {
  try {
    const db = await getDb();
    const { name, value } = (await req.json()) as Setting;

    if (!name) {
      return Response.json('name is required', {
        status: 400,
      });
    }

    if (!value) {
      return Response.json('value is required', {
        status: 400,
      });
    }

    const query = 'UPDATE general_settings SET value = ? WHERE name = ?';
    const result = await db.run(query, [value, name]);

    return Response.json(result, {
      status: 200,
    });
  } catch (error: any) {
    console.error('an error occured', error);
    return Response.json(error, {
      status: 500,
    });
  }
}
