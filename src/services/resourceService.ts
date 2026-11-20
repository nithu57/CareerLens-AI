import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LearningResourceItem, SavedResourceRecord } from '@/types';

// Curated verified catalog of official documentation and high-quality resources
export const VERIFIED_RESOURCE_CATALOG: LearningResourceItem[] = [
  {
    id: 'res-react-official',
    title: 'React Official Documentation (Learn React, Hooks & Components)',
    provider: 'Official Docs',
    url: 'https://react.dev/learn',
    topic: 'React',
    type: 'documentation',
    description: 'The modern interactive documentation for React covering Hooks, State preservation, effects, and best practices.',
    isOfficial: true,
  },
  {
    id: 'res-ts-handbook',
    title: 'TypeScript Official Handbook & Type System Reference',
    provider: 'Official Docs',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    topic: 'TypeScript',
    type: 'documentation',
    description: 'Comprehensive guide to strict TypeScript typings, generics, conditional types, and utility types.',
    isOfficial: true,
  },
  {
    id: 'res-node-official',
    title: 'Node.js Official Documentation & API Reference',
    provider: 'Official Docs',
    url: 'https://nodejs.org/en/docs',
    topic: 'Node.js',
    type: 'documentation',
    description: 'Core runtime documentation for asynchronous event loop, streams, file system, buffers, and HTTP server.',
    isOfficial: true,
  },
  {
    id: 'res-firebase-firestore',
    title: 'Cloud Firestore Data Modeling & Security Rules Guide',
    provider: 'Official Docs',
    url: 'https://firebase.google.com/docs/firestore',
    topic: 'Firestore',
    type: 'documentation',
    description: 'Official Firebase guide for designing scalable document schemas, composite indexes, and strict security rules.',
    isOfficial: true,
  },
  {
    id: 'res-gemini-api',
    title: 'Google Gemini API Official Quickstart & Structured Output',
    provider: 'Official Docs',
    url: 'https://ai.google.dev/gemini-api/docs',
    topic: 'Gemini API',
    type: 'documentation',
    description: 'Learn how to generate structured JSON outputs, use multimodal inference, and invoke function calling with Gemini.',
    isOfficial: true,
  },
  {
    id: 'res-docker-getting-started',
    title: 'Docker Official Getting Started & Container Best Practices',
    provider: 'Official Docs',
    url: 'https://docs.docker.com/get-started/',
    topic: 'Docker',
    type: 'documentation',
    description: 'Comprehensive container guide covering multi-stage builds, layer caching, and docker-compose orchestration.',
    isOfficial: true,
  },
  {
    id: 'res-k8s-basics',
    title: 'Kubernetes Official Interactive Basics Tutorial',
    provider: 'Official Docs',
    url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    topic: 'Kubernetes',
    type: 'documentation',
    description: 'Deploy, explore, expose, and scale containerized applications on Kubernetes clusters.',
    isOfficial: true,
  },
  {
    id: 'res-python-docs',
    title: 'Python 3 Official Documentation & Standard Library',
    provider: 'Official Docs',
    url: 'https://docs.python.org/3/',
    topic: 'Python',
    type: 'documentation',
    description: 'Official Python tutorial, language reference, and standard library documentation.',
    isOfficial: true,
  },
  {
    id: 'res-postgres-tutorial',
    title: 'PostgreSQL Official Documentation & SQL Syntax',
    provider: 'Official Docs',
    url: 'https://www.postgresql.org/docs/',
    topic: 'SQL',
    type: 'documentation',
    description: 'Industry-standard relational database documentation covering indexing, transactions, and JSONB queries.',
    isOfficial: true,
  },
  {
    id: 'res-tailwind-docs',
    title: 'Tailwind CSS Documentation & Utility Reference',
    provider: 'Official Docs',
    url: 'https://tailwindcss.com/docs',
    topic: 'CSS / Tailwind',
    type: 'documentation',
    description: 'Modern utility-first CSS framework for rapid responsive UI development and dark mode configuration.',
    isOfficial: true,
  },
  {
    id: 'res-fcc-fullstack',
    title: 'Full Stack Web Development Course 2024 [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
    topic: 'Full-Stack Developer',
    type: 'video',
    duration: '11 hours',
    channelTitle: 'freeCodeCamp.org',
    description: 'Complete hands-on guide covering frontend, backend APIs, relational databases, and deployment.',
  },
  {
    id: 'res-fcc-react',
    title: 'React 18 Full Course - Beginner to Advanced [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    topic: 'React',
    type: 'video',
    duration: '12 hours',
    channelTitle: 'freeCodeCamp.org',
    description: 'Master modern React with Hooks, state management, routing, and real-world portfolio projects.',
  },
  {
    id: 'res-fcc-python',
    title: 'Python for Beginners - Full Course [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=eWRfhZUzrAc',
    topic: 'Python',
    type: 'video',
    duration: '4 hours',
    channelTitle: 'freeCodeCamp.org',
    description: 'Learn Python programming language basics, data structures, and script automation.',
  },
  {
    id: 'res-fcc-docker',
    title: 'Docker & Kubernetes Tutorial for Beginners [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=Wf2eSG3owoA',
    topic: 'Docker',
    type: 'video',
    duration: '3 hours',
    channelTitle: 'freeCodeCamp.org',
    description: 'Learn containerization principles, Dockerfile syntax, image optimization, and Kubernetes deployment.',
  },
  {
    id: 'res-stat-learning',
    title: 'An Introduction to Statistical Learning (ISLR) & Probability',
    provider: 'Official Docs',
    url: 'https://www.statlearning.com/',
    topic: 'Statistical Modeling & Probability',
    type: 'documentation',
    description: 'Gold-standard curriculum for statistical modeling, probability distributions, hypothesis testing, and regression analysis.',
    isOfficial: true,
  },
  {
    id: 'res-khan-stats',
    title: 'Statistics and Probability Full Course [YouTube]',
    provider: 'YouTube',
    url: 'https://www.youtube.com/watch?v=Vfo5le26IlY',
    topic: 'Statistical Modeling & Probability',
    type: 'video',
    duration: '6 hours',
    channelTitle: 'Khan Academy',
    description: 'Master random variables, probability density functions, Bayes theorem, confidence intervals, and hypothesis testing.',
  },
  {
    id: 'res-scikit-learn',
    title: 'Scikit-Learn Official User Guide & Machine Learning Algorithms',
    provider: 'Official Docs',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    topic: 'Machine Learning Algorithms',
    type: 'documentation',
    description: 'Comprehensive documentation for supervised and unsupervised algorithms: SVM, Random Forests, Gradient Boosting, and k-Means.',
    isOfficial: true,
  },
  {
    id: 'res-andrew-ng-ml',
    title: 'Machine Learning Specialization by Andrew Ng [YouTube]',
    provider: 'YouTube',
    url: 'https://www.youtube.com/playlist?list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI',
    topic: 'Machine Learning Algorithms',
    type: 'video',
    duration: '20 hours',
    channelTitle: 'DeepLearning.AI',
    description: 'Foundational machine learning algorithms, cost functions, gradient descent, regularization, and practical diagnostics.',
  },
  {
    id: 'res-data-viz-matplotlib',
    title: 'Matplotlib & Seaborn Official Data Visualization Guide',
    provider: 'Official Docs',
    url: 'https://matplotlib.org/stable/tutorials/index.html',
    topic: 'Data Visualization',
    type: 'documentation',
    description: 'Industry-standard Python visualization guide for distribution plots, heatmaps, categorical charts, and multi-panel figures.',
    isOfficial: true,
  },
  {
    id: 'res-fcc-data-viz',
    title: 'Data Visualization with Python & Matplotlib Course [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=UO98lJQ3QGI',
    topic: 'Data Visualization',
    type: 'video',
    duration: '3 hours',
    channelTitle: 'freeCodeCamp.org',
    description: 'Hands-on project-based tutorial creating exploratory data analysis (EDA) charts and interactive dashboards.',
  },
  {
    id: 'res-pytorch-blitz',
    title: 'PyTorch Deep Learning: A 60-Minute Blitz',
    provider: 'Official Docs',
    url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
    topic: 'Deep Learning (PyTorch/TensorFlow)',
    type: 'documentation',
    description: 'Official PyTorch deep learning tutorial covering Tensors, Autograd, Neural Networks (torch.nn), and model training.',
    isOfficial: true,
  },
  {
    id: 'res-fcc-pytorch',
    title: 'PyTorch for Deep Learning & Neural Networks - Full Course [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=V_xro1bcAuA',
    topic: 'Deep Learning (PyTorch/TensorFlow)',
    type: 'video',
    duration: '25 hours',
    channelTitle: 'Daniel Bourke / freeCodeCamp.org',
    description: 'End-to-end PyTorch deep learning bootcamp: computer vision, convolutional neural nets, transfer learning, and model deployment.',
  },
  {
    id: 'res-feature-engineering',
    title: 'Feature Engineering for Machine Learning & Data Preparation',
    provider: 'Official Docs',
    url: 'https://scikit-learn.org/stable/modules/preprocessing.html',
    topic: 'Feature Engineering',
    type: 'documentation',
    description: 'Techniques for categorical encoding, scaling, imputation, polynomial features, and dimensionality reduction (PCA).',
    isOfficial: true,
  },
  {
    id: 'res-model-evaluation',
    title: 'Model Evaluation, Cross-Validation & Performance Metrics Guide',
    provider: 'Official Docs',
    url: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
    topic: 'Model Evaluation & Validation',
    type: 'documentation',
    description: 'Detailed reference for ROC-AUC, Precision-Recall, F1-score, Confusion Matrix, and K-Fold cross-validation strategies.',
    isOfficial: true,
  },
  {
    id: 'res-mlops-guide',
    title: 'MLflow Official Documentation & MLOps Lifecycle Management',
    provider: 'Official Docs',
    url: 'https://mlflow.org/docs/latest/index.html',
    topic: 'MLOps & Deployment',
    type: 'documentation',
    description: 'Open-source platform for managing the end-to-end machine learning lifecycle: experiment tracking, model registry, and serving.',
    isOfficial: true,
  },
  {
    id: 'res-fcc-mlops',
    title: 'MLOps Course - Machine Learning Engineering in Production [YouTube]',
    provider: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=06-AZXmwHjo',
    topic: 'MLOps & Deployment',
    type: 'video',
    duration: '3 hours',
    channelTitle: 'freeCodeCamp.org',
    description: 'Build CI/CD pipelines for ML models, containerize training with Docker, and deploy models with FastAPI and monitoring.',
  },
  {
    id: 'res-langchain-docs',
    title: 'LangChain Official Documentation & Agent Architecture',
    provider: 'Official Docs',
    url: 'https://python.langchain.com/docs/introduction/',
    topic: 'LangChain / LlamaIndex / Agent Frameworks',
    type: 'documentation',
    description: 'Build context-aware reasoning applications, autonomous agents, chains, and retrieval-augmented generation (RAG) pipelines.',
    isOfficial: true,
  },
  {
    id: 'res-vector-db-pinecone',
    title: 'Vector Databases, Embeddings & RAG Architecture Handbook',
    provider: 'Official Docs',
    url: 'https://www.pinecone.io/learn/vector-database/',
    topic: 'Vector Databases & Embeddings (RAG)',
    type: 'documentation',
    description: 'Essential guide to dense vector embeddings, similarity search (cosine, dot product, ANN), and RAG architecture for LLMs.',
    isOfficial: true,
  },
  {
    id: 'res-system-design-primer',
    title: 'The System Design Primer - Scalable Distributed Architecture',
    provider: 'Official Docs',
    url: 'https://github.com/donnemartin/system-design-primer',
    topic: 'System Design',
    type: 'documentation',
    description: 'Learn how to design large-scale distributed systems, caching layers (Redis), load balancing, sharding, and CAP theorem.',
    isOfficial: true,
  },
];

/**
 * Searches and discovers learning resources mapped to user skill gaps
 */
export async function discoverResources(
  queryParam: string = '',
  topicParam: string = ''
): Promise<{ resources: LearningResourceItem[]; source: 'YouTube API' | 'Verified Official Catalog'; isLiveApi: boolean }> {
  // If backend endpoint is configured, query live YouTube Data API
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || '';
  if (backendBaseUrl) {
    try {
      const q = new URLSearchParams({ query: queryParam, topic: topicParam });
      const resp = await fetch(`${backendBaseUrl}/api/resources/discover?${q.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.resources) && data.resources.length > 0) {
          return {
            resources: data.resources,
            source: 'YouTube API',
            isLiveApi: true,
          };
        }
      }
    } catch (err) {
      console.warn('Backend resource search fallback to verified catalog:', err);
    }
  }

  // Filter curated verified catalog using smart multi-keyword & fuzzy matching
  let filtered = [...VERIFIED_RESOURCE_CATALOG];

  if (topicParam && topicParam !== 'All Topics') {
    const tLower = topicParam.toLowerCase();
    // Extract individual keywords (length >= 4, ignoring punctuation and stopwords)
    const keywords = tLower
      .replace(/[()&/,-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !['with', 'from', 'into', 'that', 'this'].includes(w));

    filtered = filtered.filter((r) => {
      const rTopic = r.topic.toLowerCase();
      const rTitle = r.title.toLowerCase();
      const rDesc = (r.description || '').toLowerCase();

      // Direct match
      if (rTopic.includes(tLower) || tLower.includes(rTopic) || rTitle.includes(tLower)) {
        return true;
      }

      // Keyword match
      return keywords.some((kw) => rTopic.includes(kw) || rTitle.includes(kw) || rDesc.includes(kw));
    });
  }

  if (queryParam) {
    const qLower = queryParam.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(qLower) ||
        r.topic.toLowerCase().includes(qLower) ||
        (r.description && r.description.toLowerCase().includes(qLower))
    );
  }

  // If no curated item matched an unusual or specialized skill, provide dynamic verified search learning cards
  if (filtered.length === 0 && (topicParam || queryParam)) {
    const searchTerm = (topicParam && topicParam !== 'All Topics') ? topicParam : queryParam;
    filtered.push(
      {
        id: `dynamic-yt-${encodeURIComponent(searchTerm).slice(0, 30)}`,
        title: `${searchTerm} - In-Depth Masterclass & Tutorials`,
        provider: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + ' full course tutorial')}`,
        topic: searchTerm,
        type: 'video',
        duration: 'Comprehensive',
        channelTitle: 'Verified Tech Educators',
        description: `Curated video tutorials, hands-on coding walkthroughs, and practical projects for mastering ${searchTerm}.`,
        isOfficial: false,
      },
      {
        id: `dynamic-docs-${encodeURIComponent(searchTerm).slice(0, 30)}`,
        title: `${searchTerm} - Official Documentation & Developer Guide`,
        provider: 'Official Docs',
        url: `https://devdocs.io/#q=${encodeURIComponent(searchTerm)}`,
        topic: searchTerm,
        type: 'documentation',
        description: `Official technical API reference, syntax specifications, and architecture best practices for ${searchTerm}.`,
        isOfficial: true,
      }
    );
  }

  return {
    resources: filtered,
    source: 'Verified Official Catalog',
    isLiveApi: false,
  };
}

/**
 * Save resource to user's saved_resources subcollection
 */
export async function saveResourceToFirestore(
  userId: string,
  resource: LearningResourceItem
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'saved_resources', resource.id);
  const record: SavedResourceRecord = {
    id: resource.id,
    userId,
    resource,
    savedAt: new Date().toISOString(),
    completed: false,
  };
  try {
    const savePromise = setDoc(docRef, record, { merge: true });
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore saveResource timeout')), 4000)
    );
    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Firestore saveResource background queue:', err);
  }
}

/**
 * Toggle completed state for saved resource
 */
export async function toggleSavedResourceCompleted(
  userId: string,
  resourceId: string,
  completed: boolean
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'saved_resources', resourceId);
  try {
    const savePromise = setDoc(
      docRef,
      {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      },
      { merge: true }
    );
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore toggleResource timeout')), 4000)
    );
    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Firestore toggleResource background queue:', err);
  }
}

/**
 * Remove saved resource from Firestore
 */
export async function removeSavedResource(
  userId: string,
  resourceId: string
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'saved_resources', resourceId);
  await deleteDoc(docRef);
}

/**
 * Get all saved resources for a user
 */
export async function getSavedResources(userId: string): Promise<SavedResourceRecord[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'saved_resources');
  const q = query(colRef, orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SavedResourceRecord);
}

/**
 * Real-time listener for saved resources
 */
export function subscribeSavedResources(
  userId: string,
  callback: (resources: SavedResourceRecord[]) => void
): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const colRef = collection(db, 'users', userId, 'saved_resources');
  const q = query(colRef, orderBy('savedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => d.data() as SavedResourceRecord);
    callback(list);
  });
}
