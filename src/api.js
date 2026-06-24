// Vite automatically checks if it's running in production
// Automatically switches between local development port and production root url
const BASE_URL = "https://visitor-x-backend.onrender.com";
// 1. Function to GET all visitors
export async function getAllVisitors() {
  try {
    const response = await fetch(`${BASE_URL}/api/visitors`); 
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error in getAllVisitors:", error);
    throw error;
  }
}

// 2. Function to POST a new visitor
export async function registerVisitor(visitorData) {
  try {
    const response = await fetch(`${BASE_URL}/api/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error in registerVisitor:", error);
    throw error;
  }
}
