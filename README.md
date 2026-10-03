# 💙 BlueCrown — Crowdfunding Platform

**BlueCrown** is a modern crowdfunding platform where creators can launch campaigns and raise funds through community contributions, while supporters can discover campaigns, purchase credits, and contribute to causes they care about.

The platform provides separate experiences for **Supporters, Creators, and Admins**, with role-based authorization and dedicated dashboards for each user type.

## 🌐 Live Website

**Live Site:** `https://bluecrown-client-with-openai.vercel.app/`

## 🔐 Admin Credentials

**Admin Email:** `admin@bluecrown.com`
**Admin Password:** `admin123`

> Please use the above credentials to explore the Admin Dashboard and its features.

---
## 📸 Screenshots

### 🏠 Home Page
![BlueCrown Home Page](./home.png)

### 🚀 Campaigns
![Campaigns Page](/campaigns.png)

### 👤 Supporter Dashboard
![Supporter Dashboard](/supporter-dashboard.png)

### 🧑‍💻 Creator Dashboard
![Creator Dashboard](/creator-dashboard.png)

### 🛡️ Admin Dashboard
![Admin Dashboard](/admin-dashboard.png)

## ✨ Key Features

* 🔐 **Secure Authentication** — Users can register and log in using email/password or Google Sign-In.
* 👥 **Role-Based Access Control** — Separate permissions and dashboards for Supporters, Creators, and Admins.
* 🚀 **Campaign Creation** — Creators can create and manage their own crowdfunding campaigns.
* 🔎 **Campaign Exploration** — Supporters can browse approved and active campaigns.
* 💰 **Credit-Based Contribution System** — Supporters can use platform credits to contribute to campaigns.
* 💳 **Credit Purchase** — Supporters can purchase different credit packages through Stripe.
* 📊 **Creator Dashboard** — Creators can monitor campaigns, contributions, earnings, and withdrawal requests.
* 🛡️ **Admin Dashboard** — Admins can manage users, campaigns, withdrawal requests, and reports.
* ✅ **Campaign Approval System** — Admins can approve or reject newly submitted campaigns.
* 💸 **Withdrawal System** — Creators can request withdrawals after reaching the minimum required credits.
* 🔔 **Real-Time Notification System** — Users receive notifications for important campaign, contribution, and withdrawal activities.
* 🖼️ **Image Uploading** — Profile and campaign images can be uploaded using ImgBB.
* 📄 **Contribution History** — Supporters can track their previous contributions and their current status.
* 💼 **Payment History** — Users can view their previous payment and withdrawal records.
* 📑 **Pagination** — Supporters can navigate through their contributions using pagination.
* 🚨 **Campaign Reporting** — Supporters can report suspicious or fraudulent campaigns for admin review.
* 📱 **Fully Responsive Design** — The platform is optimized for mobile, tablet, and desktop devices.
* 🎨 **Modern UI/UX** — Clean, responsive, and consistent interface throughout the platform.
* 🔒 **Protected Routes** — Private dashboard routes are protected based on authentication and user roles.
* ⚡ **Dynamic Dashboard Statistics** — Users can view relevant campaign, contribution, credit, and payment statistics.

---

## 👤 User Roles

### 🙋 Supporter

Supporters can:

* Explore approved campaigns
* View campaign details
* Purchase platform credits
* Contribute credits to campaigns
* Track their contributions
* View payment history
* Receive notifications
* Report suspicious campaigns

### 🚀 Creator

Creators can:

* Create new campaigns
* Manage their campaigns
* Review supporter contributions
* Approve or reject contributions
* Track total funds raised
* Request withdrawals
* View withdrawal/payment history
* Receive notifications

### 🛡️ Admin

Admins can:

* Manage users
* Change user roles
* Approve or reject campaigns
* Manage existing campaigns
* Process withdrawal requests
* Review reported campaigns
* Suspend or delete reported campaigns
* Monitor platform statistics

---



## 🧑‍💻 Technology Stack

### Frontend

* Next.js
* React.js
* JavaScript
* Tailwind CSS
* DaisyUI
* React Icons
* Swiper / Carousel

### Backend

* Node.js
* Express.js
* MongoDB
* MongoDB Atlas

### Authentication & Security

* JWT
* Role-Based Authorization
* Protected Routes
* Environment Variables

### Payment & Media

* Stripe
* ImgBB


---

## 🔐 Security Features

* JWT-based authentication
* Role-based authorization
* Protected dashboard routes
* Environment variables for sensitive credentials
* MongoDB credentials hidden using environment variables
* Server-side role verification
* Protected API endpoints
* Secure payment integration

---

## 📱 Responsive Design

BlueCrown is designed to provide a consistent experience across:

* 📱 Mobile devices
* 📲 Tablets
* 💻 Laptops
* 🖥️ Desktop screens

The dashboard is also fully responsive for different screen sizes.

---


## 🎯 Project Goal

The goal of BlueCrown is to provide a simple and transparent crowdfunding experience where:

**Supporters → Purchase Credits → Contribute to Campaigns → Creators Raise Funds → Creators Request Withdrawals**

The platform demonstrates practical implementation of authentication, authorization, CRUD operations, payment processing, role-based dashboards, notifications, image uploading, and database management.

---