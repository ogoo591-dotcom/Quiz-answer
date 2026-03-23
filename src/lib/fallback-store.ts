type UserRecord = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ArticleRecord = {
  id: string;
  title: string;
  content: string;
  summary: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type QuizRecord = {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  answer: string;
  createdAt: Date;
  updatedAt: Date;
};

const globalStore = globalThis as unknown as {
  fallbackStore?: {
    users: UserRecord[];
    articles: ArticleRecord[];
    quizzes: QuizRecord[];
  };
};

if (!globalStore.fallbackStore) {
  globalStore.fallbackStore = {
    users: [],
    articles: [],
    quizzes: [],
  };
}

const store = globalStore.fallbackStore;

const uid = () => crypto.randomUUID();

export const fallbackStore = {
  upsertUser(input: { clerkId: string; email: string; name?: string | null }) {
    const now = new Date();
    const existing = store.users.find((u) => u.clerkId === input.clerkId);
    if (existing) {
      existing.email = input.email;
      existing.name = input.name ?? existing.name;
      existing.updatedAt = now;
      return existing;
    }
    const user: UserRecord = {
      id: uid(),
      clerkId: input.clerkId,
      email: input.email,
      name: input.name ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(user);
    return user;
  },

  findUserByClerkId(clerkId: string) {
    return store.users.find((u) => u.clerkId === clerkId) ?? null;
  },

  createArticle(input: {
    title: string;
    content: string;
    summary: string;
    userId: string;
  }) {
    const now = new Date();
    const article: ArticleRecord = {
      id: uid(),
      title: input.title,
      content: input.content,
      summary: input.summary,
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    };
    store.articles.push(article);
    return article;
  },

  findArticlesByUserId(userId: string) {
    return store.articles
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  findArticleById(id: string) {
    return store.articles.find((a) => a.id === id) ?? null;
  },

  createQuizzes(
    articleId: string,
    questions: Array<{ question: string; options: string[]; answer: string }>,
  ) {
    const now = new Date();
    const created = questions.map((q) => ({
      id: uid(),
      articleId,
      question: q.question,
      options: q.options,
      answer: q.answer,
      createdAt: now,
      updatedAt: now,
    }));
    store.quizzes.push(...created);
    return created;
  },

  findQuizzesByArticleId(articleId: string) {
    return store.quizzes.filter((q) => q.articleId === articleId);
  },
};
