# House of Joy - Admin Dashboard

This is the admin dashboard for the House of Joy ticketing system. It allows administrators to manage and monitor ticket sales and event attendees.

## Features

- View dashboard statistics (total tickets sold, revenue, etc.).
- View a paginated and filterable list of all approved tickets.
- Manage protocol team members.
- Secure login for administrators.

## Tech Stack

- React
- TypeScript
- Vite
- Mantine UI
- Zustand for state management
- TanStack Query for data fetching

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn
- A running instance of the [ticketing-system backend](https://github.com/your-repo/ticketing-system).

### Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd house-of-joy-admin
    ```

2.  **Install dependencies:**

    ```bash
    yarn install
    ```

3.  **Configure environment variables:**

    Create a `.env.local` file in the root of the `house-of-joy-admin` directory and add the following environment variable. This should point to the URL where your backend is running.

    ```
    VITE_API_BASE_URL=http://localhost:8080/api/v1
    ```

4.  **Run the development server:**

    ```bash
    yarn dev
    ```

    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Available Pages

-   **/login**: Admin login page.
-   **/dashboard**: Main dashboard with key statistics.
-   **/approved-tickets**: A detailed view of all tickets with a "SUCCESS" payment status. You can filter tickets by type (Student, Non-Student) and payment method.
-   **/protocol-team**: Page to manage protocol team members (creation and viewing).

## How to Use

1.  Start the backend server.
2.  Start the admin frontend development server (`yarn dev`).
3.  Navigate to the application URL.
4.  Log in using admin credentials. The default credentials can be found in the backend's `AdminUserSeeder`.
5.  Once logged in, you can navigate between the Dashboard, Approved Tickets, and Protocol Team pages using the sidebar.
