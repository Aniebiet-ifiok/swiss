if (email === DUMMY_ADMIN.email && password === DUMMY_ADMIN.password) {
  localStorage.setItem("isAdmin", "true");
  toast.success("Login successful!");
  navigate("/admin_dashboard");
}
