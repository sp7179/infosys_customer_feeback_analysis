export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ message: "No file provided" }, { status: 400 });
    }

    const backendForm = new FormData();
    backendForm.append("file", file, file.name); // IMPORTANT FIX

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/analyze`, {
      method: "POST",
      body: backendForm,
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("Backend not reachable:", err);
    return Response.json({ message: "Backend not connected" }, { status: 500 });
  }
}
