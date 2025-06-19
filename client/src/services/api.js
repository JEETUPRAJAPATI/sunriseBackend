const API_BASE_URL = "/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(method, url, data = null) {
    console.log(
      `API Request: ${method} ${this.baseURL}${url}`,
      data || "(no data)",
    );

    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);

      console.log(`API Response: ${response.status} ${response.statusText}`);
      console.log("Content-Type:", response.headers.get("content-type"));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            message: `HTTP error! status: ${response.status}`,
            details: errorText,
          };
        }

        const errorMessage =
          errorData.message || `HTTP error! status: ${response.status}`;
        console.error("API Error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);
      return responseData;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  async get(url) {
    return this.request("GET", url);
  }

  async post(url, data) {
    return this.request("POST", url, data);
  }

  async put(url, data) {
    return this.request("PUT", url, data);
  }

  async patch(url, data) {
    return this.request("PATCH", url, data);
  }

  async delete(url) {
    return this.request("DELETE", url);
  }

  // Authentication methods
  async login(credentials) {
    return this.post("/auth/login", credentials);
  }

  async logout() {
    return this.post("/auth/logout");
  }

  async getCurrentUser() {
    try {
      const response = await this.get("/auth/me");
      return response;
    } catch (error) {
      if (error.message.includes("401")) {
        // User is not authenticated
        return null;
      }
      throw error;
    }
  }

  async changePassword(passwordData) {
    return this.post("/auth/change-password", passwordData);
  }

  // User management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/users${queryString ? `?${queryString}` : ""}`);
  }

  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post("/users", userData);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async resetUserPassword(id, passwordData) {
    return this.post(`/users/${id}/reset-password`, passwordData);
  }

  // Dashboard
  async getDashboardMetrics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(
      `/dashboard/metrics${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getProductionChart(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(
      `/dashboard/production-chart${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getSalesChart(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(
      `/dashboard/sales-chart${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getRecentOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(
      `/dashboard/recent-orders${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/dashboard/alerts${queryString ? `?${queryString}` : ""}`);
  }

  // Orders
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/orders${queryString ? `?${queryString}` : ""}`);
  }

  async getOrderById(id) {
    return this.get(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.post("/orders", orderData);
  }

  async updateOrder(id, orderData) {
    return this.put(`/orders/${id}`, orderData);
  }

  async deleteOrder(id) {
    return this.delete(`/orders/${id}`);
  }

  // Settings
  async getSettings() {
    return this.get("/settings");
  }

  async updateSettings(settingsData) {
    return this.put("/settings", settingsData);
  }

  async updateCompanySettings(companyData) {
    return this.put("/settings/company", companyData);
  }

  async updateSystemSettings(systemData) {
    return this.put("/settings/system", systemData);
  }

  async updateEmailSettings(emailData) {
    return this.put("/settings/email", emailData);
  }

  async updateModuleSettings(moduleData) {
    return this.put("/settings/modules", moduleData);
  }

  async updateNotificationSettings(notificationData) {
    return this.put("/settings/notifications", notificationData);
  }

  // Inventory API methods
  async getItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/items?${queryString}`);
  }

  async getItemById(id) {
    return this.get(`/items/${id}`);
  }

  async createItem(itemData) {
    return this.post("/items", itemData);
  }

  async updateItem(id, itemData) {
    return this.put(`/items/${id}`, itemData);
  }

  async deleteItem(id) {
    return this.delete(`/items/${id}`);
  }

  async adjustStock(id, adjustmentData) {
    return this.post(`/items/${id}/adjust-stock`, adjustmentData);
  }

  async getCategories() {
    return this.get("/categories");
  }

  async createCategory(categoryData) {
    return this.post("/categories", categoryData);
  }

  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}`, categoryData);
  }

  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  async getCustomerCategories() {
    return this.get("/customer-categories");
  }

  async createCustomerCategory(categoryData) {
    return this.post("/customer-categories", categoryData);
  }

  async updateCustomerCategory(id, categoryData) {
    return this.put(`/customer-categories/${id}`, categoryData);
  }

  async deleteCustomerCategory(id) {
    return this.delete(`/customer-categories/${id}`);
  }

  async getLowStockItems() {
    return this.get("/inventory/low-stock");
  }

  async getInventoryStats() {
    return this.get("/inventory/stats");
  }

  // Profile Management
  async getProfile() {
    return this.get("/users/profile");
  }

  async updateProfile(data) {
    return this.put("/users/profile", data);
  }

  async changePassword(data) {
    return this.put("/users/profile/password", data);
  }

  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("picture", file);

    const response = await fetch("/users/profile/picture", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiService();
