
export async function POST(req: Request) {
    const data = await req.json();
    console.log('LOG:', data);
    return new Response('ok');
}
