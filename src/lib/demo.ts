export type DemoDocument = {
  id: string;
  name: string;
  url: string;
  summary: string;
  pageCount: number;
  thumbnailUrl: string;
};

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: "demo-1",
    name: "Introduction to Machine Learning.pdf",
    url: "https://your-bucket.s3.amazonaws.com/demo/ml-intro.pdf",
    summary:
      "An overview of machine learning concepts, algorithms, and applications.",
    pageCount: 25,
    thumbnailUrl: "/demo/ml-thumb.png",
  },
  {
    id: "demo-2",
    name: "Web Development Best Practices.pdf",
    url: "https://your-bucket.s3.amazonaws.com/demo/webdev.pdf",
    summary: "Guide to modern web development patterns and practices.",
    pageCount: 18,
    thumbnailUrl: "/demo/webdev-thumb.png",
  },
  {
    id: "demo-3",
    name: "Product Management Framework.pdf",
    url: "https://your-bucket.s3.amazonaws.com/demo/pm-framework.pdf",
    summary:
      "Framework for product development and stakeholder management.",
    pageCount: 32,
    thumbnailUrl: "/demo/pm-thumb.png",
  },
];

export const DEMO_CONVERSATIONS = [
  {
    id: "demo-conv-1",
    fileId: "demo-1",
    messages: [
      {
        role: "user" as const,
        content: "What are the main types of machine learning?",
      },
      {
        role: "assistant" as const,
        content:
          "According to the document, there are three main types of machine learning: supervised, unsupervised, and reinforcement learning.",
      },
    ],
  },
];
