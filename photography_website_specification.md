# Photography Website Specification Document

## 1. Project Overview

This project is a photography marketing website with a portfolio system, contact form, admin dashboard, and backend API. The website will present the photographer's brand, services, portfolio work, and contact/booking options. The admin dashboard will allow the website owner to create portfolio entries and manage images without editing code.

## 2. Recommended Site Structure

The website can be implemented in either of the following structures:

### Option A: One-page marketing website
All public sections are placed on a single landing page:

- Hero
- About
- Services
- Featured portfolio
- Testimonials
- Contact form
- Footer

Portfolio items can still open as dynamic detail pages.

### Option B: Two-page marketing website — recommended
The public site has two main pages:

1. **Home page**: Brand introduction, services, featured work, testimonials, and contact call-to-action.
2. **Portfolio page**: Filterable portfolio listing with project cards.

Each portfolio item opens a dynamic detail page containing the project description, cover image, and gallery images.

Recommended URL structure:

```txt
/                       Home page
/portfolio              Portfolio listing page
/portfolio/:slug        Portfolio detail page
/contact                Optional, if contact is separated from homepage
/admin                  Admin dashboard login
/admin/portfolio        Manage portfolio items
/admin/portfolio/new    Create portfolio item
/admin/portfolio/:id    Edit portfolio item and images
```

## 3. Public Website Features

### 3.1 Home Page

The home page should communicate the photographer's brand quickly and visually.

Sections:

1. **Hero section**
   - Large background image or featured image
   - Main headline
   - Short subheadline
   - Primary CTA: Book a Shoot / Contact Me
   - Secondary CTA: View Portfolio

2. **About section**
   - Photographer introduction
   - Profile image
   - Brand story or mission
   - Location and service areas

3. **Services section**
   - Service cards for photography categories
   - Examples: Weddings, Portraits, Events, Product Photography, Lifestyle, Fashion, Real Estate
   - Optional pricing/package information

4. **Featured portfolio section**
   - Selected portfolio items
   - Cover image, title, short description, category
   - Link to full portfolio detail

5. **Testimonials section**
   - Client name
   - Testimonial text
   - Optional client photo or shoot category

6. **Contact / booking section**
   - Contact form
   - WhatsApp button
   - Email and phone
   - Social media links

7. **Footer**
   - Logo/name
   - Navigation links
   - Contact details
   - Social links
   - Copyright notice

### 3.2 Portfolio Listing Page

The portfolio page displays all published portfolio projects.

Required features:

- Portfolio cards
- Cover image
- Title
- Short description
- Category
- Optional date/location
- Filter by category
- Search by title or category
- Responsive grid layout
- Empty state when no portfolio exists

### 3.3 Portfolio Detail Page

Each portfolio detail page should show the full project/gallery.

Required fields:

- Portfolio title
- Slug for URL
- Category
- Short description
- Full description
- Cover image
- Gallery images
- Optional captions per image
- Optional shoot date
- Optional shoot location
- Optional client name
- Optional call-to-action: Book similar shoot

Recommended behavior:

- Images open in a lightbox/gallery viewer
- Gallery supports next/previous navigation
- Portfolio detail page should include related portfolio items
- Images should be lazy-loaded for performance

### 3.4 Contact Form

The contact form should collect booking or inquiry details.

Recommended fields:

- Full name
- Email address
- Phone / WhatsApp number
- Shoot type
- Preferred date
- Location
- Budget range, optional
- Message

Form behavior:

- Validate required fields
- Send email notification to website owner
- Save submission in backend database
- Show success message after submission
- Show error message if submission fails
- Include spam protection such as CAPTCHA, honeypot field, rate limiting, or both

## 4. Admin Dashboard Features

### 4.1 Authentication

Admin users must log in before accessing the dashboard.

Required features:

- Login with email and password
- Protected admin routes
- Logout
- Password hashing on backend
- Optional password reset

### 4.2 Portfolio Management

Admin should be able to:

- Create portfolio item
- Edit portfolio item
- Delete portfolio item
- Publish/unpublish portfolio item
- Upload cover image
- Upload multiple gallery images
- Reorder gallery images
- Delete gallery image
- Add image caption, optional
- Assign category
- Mark portfolio as featured

Portfolio fields:

| Field | Type | Required | Notes |
|---|---:|---:|---|
| title | string | Yes | Portfolio/project name |
| slug | string | Yes | URL-friendly unique value |
| short_description | text | Yes | Used on cards/listing |
| full_description | long text | No | Used on detail page |
| category_id | ID | No | Portfolio category |
| cover_image_url | string | Yes | Main display image |
| shoot_date | date | No | Optional project date |
| location | string | No | Optional shoot location |
| client_name | string | No | Optional client/project name |
| is_featured | boolean | Yes | Show on homepage |
| is_published | boolean | Yes | Public visibility |
| sort_order | number | No | Manual ordering |

### 4.3 Portfolio Image Management

Portfolio images should be stored separately from the portfolio item so each portfolio can have many images.

Image fields:

| Field | Type | Required | Notes |
|---|---:|---:|---|
| portfolio_id | ID | Yes | Parent portfolio |
| image_url | string | Yes | Uploaded image URL |
| public_id | string | No | Storage provider reference |
| caption | string | No | Optional image text |
| alt_text | string | No | SEO/accessibility text |
| sort_order | number | No | Gallery order |

### 4.4 Category Management

Admin should be able to manage portfolio categories.

Required features:

- Create category
- Edit category
- Delete category if unused
- View portfolios under category

Category fields:

| Field | Type | Required |
|---|---:|---:|
| name | string | Yes |
| slug | string | Yes |
| description | text | No |
| sort_order | number | No |

### 4.5 Contact Message Management

Admin should be able to view contact form submissions.

Required features:

- View all messages
- View one message
- Mark as read/unread
- Delete message
- Search/filter messages

Contact message fields:

| Field | Type | Required |
|---|---:|---:|
| full_name | string | Yes |
| email | string | Yes |
| phone | string | No |
| shoot_type | string | No |
| preferred_date | date | No |
| location | string | No |
| budget_range | string | No |
| message | text | Yes |
| status | enum | Yes |
| created_at | timestamp | Yes |

## 5. Backend Specification

The backend will expose APIs for the public website and admin dashboard.

### 5.1 Recommended Backend Stack

Recommended options:

- Node.js + Express + MongoDB
- TypeScript React
- File storage: Cloudinary
- Email delivery:  Resend

For a small photography website, Node.js with Express is enough and fast to build. Cloudinary is recommended for image uploads because it handles image optimization, transformations, and CDN delivery.

### 5.2 API Modules

Backend modules:

1. Authentication
2. Admin users
3. Portfolio categories
4. Portfolio items
5. Portfolio images
6. Contact messages
7. File/image uploads
8. Site settings, optional

### 5.3 Public API Endpoints

```txt
GET    /api/public/portfolio
GET    /api/public/portfolio/featured
GET    /api/public/portfolio/:slug
GET    /api/public/categories
POST   /api/public/contact
```

### 5.4 Admin API Endpoints

```txt
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me

GET    /api/admin/portfolio
POST   /api/admin/portfolio
GET    /api/admin/portfolio/:id
PATCH  /api/admin/portfolio/:id
DELETE /api/admin/portfolio/:id
PATCH  /api/admin/portfolio/:id/publish
PATCH  /api/admin/portfolio/:id/feature

POST   /api/admin/portfolio/:id/images
PATCH  /api/admin/portfolio/:id/images/reorder
PATCH  /api/admin/portfolio/images/:imageId
DELETE /api/admin/portfolio/images/:imageId

GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
DELETE /api/admin/categories/:id

GET    /api/admin/contact-messages
GET    /api/admin/contact-messages/:id
PATCH  /api/admin/contact-messages/:id/status
DELETE /api/admin/contact-messages/:id

POST   /api/admin/uploads/image
```

## 6. Database Design

### 6.1 admins

```sql
admins (
  id UUID PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 6.2 portfolio_categories

```sql
portfolio_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 6.3 portfolios

```sql
portfolios (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES portfolio_categories(id),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  full_description TEXT,
  cover_image_url TEXT NOT NULL,
  cover_image_public_id TEXT,
  shoot_date DATE,
  location VARCHAR(200),
  client_name VARCHAR(200),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 6.4 portfolio_images

```sql
portfolio_images (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_public_id TEXT,
  caption VARCHAR(255),
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 6.5 contact_messages

```sql
contact_messages (
  id UUID PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  shoot_type VARCHAR(150),
  preferred_date DATE,
  location VARCHAR(200),
  budget_range VARCHAR(100),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'unread',
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 7. Frontend Requirements

### 7.1 Public Frontend

Required pages/components:

- Home page
- Portfolio listing page
- Portfolio detail page
- Contact form component
- Header/navbar
- Footer
- Portfolio card
- Image gallery/lightbox
- Category filter
- Loading states
- Empty states
- Error states

### 7.2 Admin Frontend

Required pages/components:

- Admin login page
- Dashboard overview
- Portfolio list page
- Portfolio create/edit form
- Gallery image uploader
- Image reorder interface
- Category management page
- Contact message inbox
- Settings page, optional

## 8. Image Upload Requirements

The system should support high-quality photography images while protecting website performance.

Requirements:

- Accept JPEG, PNG, WebP
- Limit file size based on hosting choice
- Compress/optimize images after upload
- Generate responsive image sizes if supported by storage provider
- Store image URL and storage public ID
- Lazy-load images on public pages
- Use alt text for accessibility and SEO

## 9. SEO Requirements

Public pages should include:

- Page title
- Meta description
- Open Graph title/image/description
- Twitter card metadata
- SEO-friendly portfolio URLs
- Image alt text
- Sitemap
- Robots.txt
- Structured data for local business/photographer, optional

## 10. Security Requirements

- Passwords must be hashed
- Admin routes must require authentication
- File uploads must validate type and size
- Contact form should include spam protection
- API should include rate limiting
- CORS should be configured safely
- Environment variables should be used for secrets
- Admin actions should not expose sensitive stack traces

## 11. Non-Functional Requirements

- Mobile responsive design
- Fast image loading
- Clean, premium visual style suitable for photography
- Accessible text contrast
- SEO-friendly markup
- Error handling for failed API calls
- Admin dashboard should be simple enough for non-technical users

## 12. Suggested Delivery Phases

### Phase 1: Planning and content collection

- Collect client information
- Confirm site structure
- Confirm branding direction
- Prepare portfolio categories and first portfolio items

### Phase 2: Public website

- Build home page
- Build portfolio listing
- Build portfolio detail page
- Build contact form UI

### Phase 3: Backend API

- Set up database
- Build authentication
- Build portfolio/category APIs
- Build contact form API
- Integrate image upload provider

### Phase 4: Admin dashboard

- Build login
- Build portfolio management
- Build image gallery management
- Build contact message inbox

### Phase 5: QA and deployment

- Test responsiveness
- Test image uploads
- Test form submissions
- Test admin permissions
- Set up domain, hosting, analytics, and SEO metadata

## 13. Acceptance Criteria

The project is complete when:

- Public website loads correctly on mobile, tablet, and desktop
- Homepage displays brand content, services, featured portfolio, and contact CTA
- Portfolio page lists published portfolio items
- Portfolio detail page displays all images for a selected portfolio
- Contact form validates input and sends/stores submissions
- Admin can log in securely
- Admin can create/edit/delete portfolio items
- Admin can upload and manage portfolio images
- Admin can publish/unpublish portfolio items
- Admin can view contact messages
- Images are optimized and lazy-loaded
- SEO metadata is configured
- Website is deployed successfully

## 14. Content the Client Must Provide

Before development begins, the client should provide:

- Business/photographer name
- Logo and brand colors
- Brand story/about text
- Service list
- Portfolio categories
- Existing portfolio projects with images
- Contact email and phone/WhatsApp
- Social media links
- Testimonials, if available
- Domain and hosting details, if available
- SEO keywords or target locations
