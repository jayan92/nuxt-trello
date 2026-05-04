import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = resolve(__dirname, "../.env");
const envVars = readFileSync(envPath, "utf-8")
  .split("\n")
  .filter((line) => line.trim() && !line.startsWith("#"))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split("=");
    acc[key.trim()] = rest.join("=").trim();
    return acc;
  }, {});

const MONGODB_URI = envVars.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

// ── Schemas ────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    stripeCustomerId: { type: String, default: null },
    subscription: {
      id: { type: String, default: null },
      status: { type: String, default: null },
      priceId: { type: String, default: null },
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const boardSchema = new mongoose.Schema(
  {
    name: String,
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coverImage: { type: String, default: null },
  },
  { timestamps: true }
);

const listSchema = new mongoose.Schema(
  {
    name: String,
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const cardSchema = new mongoose.Schema(
  {
    title: String,
    description: { type: String, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    list: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Board = mongoose.model("Board", boardSchema);
const List = mongoose.model("List", listSchema);
const Card = mongoose.model("Card", cardSchema);

// ── Seed data ───────────────────────────────────────────────────────────────

const DEMO_EMAIL = "demo@nrello.com";
const DEMO_PASSWORD = "Demo1234!";

const seedData = [
  {
    board: {
      name: "Product Roadmap",
      coverImage:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
    },
    lists: [
      {
        name: "Backlog",
        cards: [
          {
            title: "User authentication flow",
            description:
              "<p>Implement OAuth2 login with Google and GitHub providers. Ensure session persistence across page reloads.</p>",
          },
          {
            title: "Dark mode support",
            description:
              "<p>Add a theme toggle to the nav. Persist preference in localStorage and respect system preference on first visit.</p>",
          },
          {
            title: "Mobile responsive layout",
            description:
              "<p>Review all pages on small screens. Fix card overflow and collapsed sidebar issues on < 768px viewports.</p>",
          },
          {
            title: "Export boards to PDF",
            description:
              "<p>Allow users to download a board snapshot as a formatted PDF. Use puppeteer on the server side.</p>",
          },
        ],
      },
      {
        name: "In Progress",
        cards: [
          {
            title: "Drag & drop card reordering",
            description:
              "<p>Cards can be dragged between lists. Persist order to MongoDB on drop. Show a placeholder while dragging.</p>",
          },
          {
            title: "Rich text card descriptions",
            description:
              "<p>Replace plain textarea with Quill editor. Support bold, italic, lists and inline code blocks.</p>",
          },
          {
            title: "Board cover images via Pixabay",
            description:
              "<p>Integrate the Pixabay API image picker. Show a search input and paginated results grid in the board settings slideover.</p>",
          },
        ],
      },
      {
        name: "Review",
        cards: [
          {
            title: "Stripe subscription gating",
            description:
              "<p>Free plan is limited to 1 board. Upgrade modal triggers when limit is hit. Webhook updates subscription status.</p>",
          },
          {
            title: "Board delete confirmation",
            description:
              "<p>Show a toast with cancel/confirm before deleting. Cascade delete all lists and cards belonging to the board.</p>",
          },
        ],
      },
      {
        name: "Done",
        cards: [
          {
            title: "Project scaffolding",
            description:
              "<p>Nuxt 3 app with @nuxt/ui, MongoDB via Mongoose, and pnpm workspace configured.</p>",
          },
          {
            title: "Auth middleware",
            description:
              "<p>Server middleware protects /api/boards, /api/lists, and /api/users routes. Returns 401 for unauthenticated requests.</p>",
          },
          {
            title: "Board & list CRUD API",
            description:
              "<p>REST endpoints for creating, reading, updating and deleting boards and lists. Zod validation on all POST/PUT bodies.</p>",
          },
        ],
      },
    ],
  },
  {
    board: {
      name: "Marketing Campaign Q1",
      coverImage:
        "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800",
    },
    lists: [
      {
        name: "Ideas",
        cards: [
          {
            title: "Launch blog series",
            description:
              "<p>Write 4 posts covering: project planning, team collaboration, productivity tips, and tool comparisons. Publish weekly.</p>",
          },
          {
            title: "Social media strategy",
            description:
              "<p>Define posting cadence for Twitter, LinkedIn, and Instagram. Create a content calendar for 8 weeks.</p>",
          },
          {
            title: "Influencer outreach",
            description:
              "<p>Identify 10 productivity YouTubers with 50k–500k subs. Draft DM templates for partnership proposals.</p>",
          },
        ],
      },
      {
        name: "Planned",
        cards: [
          {
            title: "Product Hunt launch",
            description:
              "<p>Schedule for first Tuesday of next month. Prepare assets: logo, tagline, screenshots, 60s demo video.</p>",
          },
          {
            title: "Email newsletter",
            description:
              "<p>Design a welcome sequence (3 emails). Highlight features, share a demo GIF, include a CTA to the free plan.</p>",
          },
        ],
      },
      {
        name: "In Progress",
        cards: [
          {
            title: "Landing page copy",
            description:
              "<p>Hero headline A/B test: 'Organize everything' vs 'Your team's command center'. Track with PostHog.</p>",
          },
          {
            title: "Demo video recording",
            description:
              "<p>Record a 90-second walkthrough: create board → add lists → drag cards. Add captions and background music.</p>",
          },
        ],
      },
      {
        name: "Shipped",
        cards: [
          {
            title: "Brand identity",
            description:
              "<p>Logo, color palette (#4F46E5 primary), and typography (Inter) finalized and added to Figma design system.</p>",
          },
        ],
      },
    ],
  },
  {
    board: {
      name: "Personal Tasks",
      coverImage:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
    },
    lists: [
      {
        name: "To Do",
        cards: [
          { title: "Read 'Shape Up' by Basecamp", description: null },
          { title: "Set up weekly review routine", description: null },
          { title: "Upgrade Node.js to v22 LTS", description: null },
        ],
      },
      {
        name: "In Progress",
        cards: [
          {
            title: "Complete Nuxt 3 tutorial series",
            description:
              "<p>Working through all modules. Currently on: authentication and protected routes.</p>",
          },
          {
            title: "Learn Tailwind CSS v3 utilities",
            description: null,
          },
        ],
      },
      {
        name: "Done",
        cards: [
          { title: "Set up MongoDB Atlas cluster", description: null },
          { title: "Configure Stripe test mode", description: null },
          {
            title: "Deploy staging environment",
            description: null,
          },
        ],
      },
    ],
  },
];

// ── Runner ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  // Wipe existing demo user data
  const existing = await User.findOne({ email: DEMO_EMAIL }).lean();
  if (existing) {
    const boardIds = await Board.find({ owner: existing._id }).distinct("_id");
    const listIds = await List.find({ owner: existing._id }).distinct("_id");
    await Card.deleteMany({ owner: existing._id });
    await List.deleteMany({ _id: { $in: listIds } });
    await Board.deleteMany({ _id: { $in: boardIds } });
    await User.deleteOne({ _id: existing._id });
    console.log("Cleared previous demo data.");
  }

  // Create user
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(DEMO_PASSWORD, salt);
  const user = await User.create({
    name: "Demo User",
    email: DEMO_EMAIL,
    password: hashed,
  });
  console.log(`Created user: ${user.email}`);

  // Create boards, lists, cards
  for (const { board: boardData, lists } of seedData) {
    const board = await Board.create({
      name: boardData.name,
      coverImage: boardData.coverImage,
      owner: user._id,
    });

    for (const { name: listName, cards } of lists) {
      const list = await List.create({
        name: listName,
        board: board._id,
        owner: user._id,
      });

      const cardIds = [];
      for (const cardData of cards) {
        const card = await Card.create({
          title: cardData.title,
          description: cardData.description || null,
          list: list._id,
          owner: user._id,
        });
        cardIds.push(card._id);
      }

      list.cards = cardIds;
      await list.save();
      board.lists.push(list._id);
    }

    await board.save();
    console.log(`  Board: "${board.name}" — ${lists.length} lists`);
  }

  console.log("\n✔ Seed complete!");
  console.log("─────────────────────────────");
  console.log(`  Email    : ${DEMO_EMAIL}`);
  console.log(`  Password : ${DEMO_PASSWORD}`);
  console.log("─────────────────────────────\n");

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
