# HITCH - Event Discovery Platform

## Overview

HITCH is a platform designed to help people discover and connect with local events. Whether you're looking for music festivals, tech meetups, art exhibitions, or sports gatherings, HITCH makes it easy to find and join events that match your interests.

## Features

*   **Event Discovery:** Browse a wide range of events based on category, date, and location.
*   **Personalized Feed:** Get event recommendations tailored to your interests.
*   **Google Authentication:** Securely sign up and log in using your Google account.
*   **Organizer Tools:** Create and manage your own events, track RSVPs, and engage with attendees.
*   **Interactive Maps:** Explore events on an interactive map.
*   **Event Chat:** Connect with other attendees in real-time chat rooms.
*   **Profile Management:** Customize your profile and manage your interests.

## Technologies Used

*   **Frontend:**
    *   React
    *   Vite
    *   Tailwind CSS
    *   Lucide React (icons)
    *   React Map GL
    *   Framer Motion
    *   Chart.js
*   **Backend:**
    *   Supabase (PostgreSQL database, authentication)
*   **Deployment:**
    *   Netlify

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd hitch-event-platform
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add your Supabase URL and Anon Key:

        ```
        VITE_SUPABASE_URL=<your_supabase_url>
        VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
        ```

    *   Make sure you have enabled Google Authentication in Supabase and configured the OAuth Redirect URI in Google Cloud Console.

4.  **Start the development server:**

    ```bash
    npm run dev
    ```

    This will start the Vite development server, and you can access the application in your browser at `http://localhost:5173`.

## Supabase Setup

1.  **Create a Supabase project:**

    *   Go to [Supabase](https://supabase.com/) and create a new project.
    *   Retrieve your Supabase URL and Anon Key from the project settings.

2.  **Enable Google Authentication:**

    *   In your Supabase project dashboard, go to Authentication > Providers and enable Google.
    *   Configure the OAuth Redirect URI in Google Cloud Console to match your Supabase project settings.

3.  **Set up database schema:**

    *   The database schema is defined in the `supabase/migrations` directory.
    *   Apply the migrations to your Supabase project using the Supabase CLI (not available in this environment, but these files show the schema):

        *   `supabase/migrations/20250407235212_velvet_scene.sql` (Profiles table)
        *   `supabase/migrations/20250407235723_restless_butterfly.sql` (Events table)
        *   `supabase/migrations/20250408001851_dusty_dust.sql` (RSVP and Chat features)
        *   `supabase/migrations/20250408002317_long_sunset.sql` (Fix Messages and Profiles Relationship)
        *   `supabase/migrations/20250408003237_yellow_lagoon.sql` (Enhance Chat System)

## Deployment

The project is designed to be deployed on Netlify.

1.  **Create a Netlify account:**

    *   Go to [Netlify](https://www.netlify.com/) and create an account.

2.  **Connect your repository:**

    *   In Netlify, create a new site from your Git repository.

3.  **Configure environment variables:**

    *   Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables to your Netlify site settings.

4.  **Deploy your site:**

    *   Netlify will automatically build and deploy your application.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

## License

[MIT](LICENSE)
