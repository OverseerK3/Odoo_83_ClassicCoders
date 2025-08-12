### https://drive.google.com/file/d/1pfUYILodiML3nrCjr-2z_QuKYy9QXb8Q/view?usp=sharing ###
# QuickCourt - Venue Booking Web App

A modern sports venue booking platform with team management and location-based player search.

## 🚀 Features

### Authentication & User Management
- **Modern 2-Column Layout**: Beautiful signup/login pages with responsive design
- **Location-Based Registration**: Users can select from 8 cities in Gujarat
- **Role-Based Access**: Player, Facility Manager, and Admin roles
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

### Team Management
- **Location-Based Player Search**: Find players by city (Ahmedabad, Vadodara, Surat, Rajkot, Gandhinagar, Mehsana, Palanpur, Bhavnagar)
- **Team Invitations**: Send and receive team invites
- **Real-time Notifications**: Pending invite notifications in sidebar
- **Team Formation**: Automatic team creation when invites are accepted

### Venue Booking
- **Smart Cancellation**: Notify waitlisted users when slots become available
- **Waitlist System**: Join waitlists for booked venues
- **Real-time Availability**: Check venue availability instantly

### Modern UI/UX
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Ubuntu Font**: Modern typography throughout the app
- **Heroicons**: Professional icon library
- **Modern Color Theme**: Clean, minimal design with blue accent colors

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)

### Backend Setup
```bash
cd backend
npm install
npm run test-setup  # Creates test data
npm start
```

### Frontend Setup
```bash
npm install
npm run dev
```

## 🧪 Test Data

The app comes with pre-configured test users for all locations:

### Players by Location
- **Ahmedabad**: john@example.com, alice@example.com
- **Vadodara**: bob@example.com, carol@example.com
- **Surat**: dave@example.com, eve@example.com
- **Rajkot**: frank@example.com, grace@example.com
- **Gandhinagar**: henry@example.com, iris@example.com
- **Mehsana**: jack@example.com, kate@example.com
- **Palanpur**: leo@example.com, maya@example.com
- **Bhavnagar**: nick@example.com, olivia@example.com

### Admin Users
- **Admin**: admin@example.com
- **Facility Manager**: manager@example.com

**Password for all accounts**: `password123`

## 🎯 Key Features Demo

### 1. Location-Based Player Search
1. Login as any player
2. Go to "My Team" page
3. Click "Invite Player"
4. Select a location from the dropdown
5. Search for players in that specific location

### 2. Team Management
1. Send invites to players in your location
2. Receive and respond to team invites
3. View your team members and pending invites

### 3. Modern Authentication
1. Visit the signup page to see the new 2-column layout
2. Create an account with location selection
3. Experience the responsive design on mobile (image column hides)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with location
- `POST /api/auth/login` - User login with role validation

### Teams
- `GET /api/teams/me` - Get current user's team
- `GET /api/teams/invites` - Get pending invites
- `GET /api/teams/search?query=&location=` - Search players by location
- `POST /api/teams/invite` - Send team invitation
- `POST /api/teams/invites/:id/respond` - Accept/reject invitation

### Bookings
- `POST /api/bookings` - Book a venue slot
- `POST /api/bookings/waitlist` - Join waitlist
- `POST /api/bookings/:id/cancel` - Cancel booking

## 🎨 Design System

### Color Palette
- **Primary**: #2563EB (Blue)
- **Secondary**: #E11D48 (Raspberry Red)
- **Background**: #FFFFFF (White)
- **Text Primary**: #1F2937 (Dark Gray)
- **Accent**: #F59E0B (Amber)

### Typography
- **Font Family**: Ubuntu (Google Fonts)
- **Weights**: 300, 400, 500, 700 (with italics)

## 📱 Responsive Design

- **Mobile**: Single column layout, hidden image sections
- **Tablet**: Adaptive layout with optimized spacing
- **Desktop**: Full 2-column layout with side-by-side content

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration

## 🚀 Getting Started

1. **Clone the repository**
2. **Set up MongoDB** and ensure it's running
3. **Install dependencies** for both frontend and backend
4. **Run the test setup** to create sample data
5. **Start both servers** and begin testing

## 📄 License

This project is licensed under the MIT License.
