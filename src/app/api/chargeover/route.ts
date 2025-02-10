export async function GET(req: Request, res: Response) {
  return Response.json({ message: 'Success' }, { status: 200 });
}
