/** Research facts transcribed from the user-provided paper, not live model output. */
export type MetricKey =
  | "accuracy"
  | "anemiaPrecision"
  | "sensitivity"
  | "anemiaF1"
  | "normalPrecision"
  | "specificity"
  | "normalF1";

export interface ResearchMetric {
  key: MetricKey;
  label: string;
  /** All Table I values, including standard deviations, are percentages. */
  yolo: number;
  baseline: number;
  yoloStd: number;
  baselineStd: number;
}

/** Table I: mean ± standard deviation across the same five stratified folds. */
export const metrics: ResearchMetric[] = [
  { key: "accuracy", label: "Accuracy", yolo: 84.74, baseline: 77.78, yoloStd: 2.2, baselineStd: 6.72 },
  { key: "anemiaPrecision", label: "Anemia precision", yolo: 80.02, baseline: 80.45, yoloStd: 5.84, baselineStd: 7.64 },
  { key: "sensitivity", label: "Sensitivity", yolo: 88.57, baseline: 65.05, yoloStd: 9.69, baselineStd: 14.31 },
  { key: "anemiaF1", label: "Anemia F1", yolo: 83.44, baseline: 71.2, yoloStd: 2.99, baselineStd: 10.24 },
  { key: "normalPrecision", label: "Normal precision", yolo: 90.83, baseline: 77.03, yoloStd: 6.71, baselineStd: 7.37 },
  { key: "specificity", label: "Specificity", yolo: 81.96, baseline: 87.52, yoloStd: 6.33, baselineStd: 5.4 },
  { key: "normalF1", label: "Normal F1", yolo: 85.74, baseline: 81.72, yoloStd: 1.95, baselineStd: 5.03 },
];

export interface Author {
  name: string;
  affiliation: string;
  location: string;
}

export interface PooledMetric {
  /** Percentage computed from all held-out predictions, not a mean across folds. */
  value: number;
  /** Two-sided 95% Wilson interval, in percentage units. */
  interval: [number, number];
}

export interface PooledModelResults {
  accuracy: PooledMetric;
  sensitivity: PooledMetric;
  specificity: PooledMetric;
  confusion: { truePositive: number; falseNegative: number; trueNegative: number; falsePositive: number };
}

export interface StatisticalComparison {
  key: "accuracy" | "sensitivity" | "specificity" | "auc";
  label: string;
  test: string;
  p: number;
  significant: boolean;
  interpretation: string;
}

export interface ResearchStudy {
  title: string;
  shortTitle: string;
  authors: Author[];
  question: string;
  summary: string;
  dataset: {
    source: string;
    url: string;
    license: string;
    raw: number;
    unique: number;
    anemia: number;
    normal: number;
    removed: number;
    laboratoryHemoglobinAvailable: boolean;
    cleaning: string[];
  };
  evaluation: {
    folds: number;
    foldSizes: number[];
    seed: number;
    protocol: string;
    metricNote: string;
    positiveClass: string;
    bonferroniAlpha: number;
    externalValidationComplete: boolean;
  };
  models: {
    yolo: { name: string; framework: string; initialization: string; inputSize: number; maxEpochs: number; earlyStoppingPatience: number; interpretation: string };
    baseline: { name: string; featureCount: number; features: string; standardization: string; interpretation: string };
  };
  auc: { yolo: number; baseline: number; yoloStd: number; baselineStd: number; difference: number; p: number };
  pooled: { yolo: PooledModelResults; baseline: PooledModelResults; agreement: number; disagreements: number };
  tests: StatisticalComparison[];
  keyFinding: string;
  limitations: string[];
  futureWork: string[];
  sourceCodeUrl: string;
  paperFile: string;
  demo: { simulated: true; disclaimer: string; integrationNote: string };
}

export const study: ResearchStudy = {
  title: "Comparing RGB Color Features and YOLO-Based Deep Learning for Noninvasive Anemia Detection from Conjunctival Images",
  shortTitle: "Conjunctival anemia screening",
  authors: [
    { name: "Pranav Sachdeva", affiliation: "Oakton High School", location: "Vienna, USA" },
    { name: "Shashank Edupuganti", affiliation: "Westfield High School", location: "Chantilly, USA" },
    { name: "Abhinav Karthik", affiliation: "Westfield High School", location: "Chantilly, USA" },
    { name: "Andreea Sistrunk", affiliation: "Technical Education and Workforce Development, Virginia Tech", location: "Alexandria, USA" },
  ],
  question: "How does a learned vision model compare with an interpretable color-feature baseline under the same evaluation conditions?",
  summary: "A proof-of-concept comparison of YOLOv8 classification and RGB/HSV logistic regression on a cleaned public conjunctival-image dataset, using matched five-fold stratified cross-validation.",
  dataset: {
    source: "Roboflow Universe conjunctiva image collection",
    url: "https://universe.roboflow.com/dastaswr-anewmia/anemia-detection-yciqn-s7qxm",
    license: "CC BY 4.0",
    raw: 288,
    unique: 157,
    anemia: 69,
    normal: 88,
    removed: 131,
    laboratoryHemoglobinAvailable: false,
    cleaning: [
      "Collapse duplicate and rotated images with a rotation-invariant perceptual hash across 0°, 90°, 180°, and 270°.",
      "Exclude images identified by ‘smote’ in their filenames; synthetic oversampling images are excluded from reported results.",
      "Assign sequential identifiers and record source filenames, labels, and fold assignments in a manifest.",
    ],
  },
  evaluation: {
    folds: 5,
    foldSizes: [32, 32, 31, 31, 31],
    seed: 42,
    protocol: "Identical five-fold stratified cross-validation splits for both models; each image receives one held-out prediction per approach.",
    metricNote: "Table I reports mean ± standard deviation across folds. Pooled metrics count all 157 held-out predictions and differ slightly because fold sizes are unequal.",
    positiveClass: "Anemia",
    bonferroniAlpha: 0.0167,
    externalValidationComplete: false,
  },
  models: {
    yolo: {
      name: "YOLOv8-cls",
      framework: "Ultralytics 8.4.96",
      initialization: "YOLOv8n classification backbone pretrained on ImageNet, fine-tuned independently for each fold",
      inputSize: 640,
      maxEpochs: 100,
      earlyStoppingPatience: 20,
      interpretation: "Grad-CAM++ visualizations provide a qualitative check of the image regions influencing predictions; they do not prove clinical validity.",
    },
    baseline: {
      name: "RGB/HSV logistic regression",
      featureCount: 12,
      features: "Mean and standard deviation of each R, G, B, H, S, and V channel",
      standardization: "Fit the feature scaler on the training portion of each fold, then apply it to the held-out portion.",
      interpretation: "Standardized coefficients make the contribution of color-channel means and variability interpretable.",
    },
  },
  auc: { yolo: 0.887, baseline: 0.869, yoloStd: 0.038, baselineStd: 0.06, difference: 0.018, p: 0.71 },
  pooled: {
    yolo: {
      accuracy: { value: 84.71, interval: [78.3, 89.5] },
      sensitivity: { value: 88.41, interval: [78.8, 94.0] },
      specificity: { value: 81.82, interval: [72.5, 88.5] },
      confusion: { truePositive: 61, falseNegative: 8, trueNegative: 72, falsePositive: 16 },
    },
    baseline: {
      accuracy: { value: 77.71, interval: [70.6, 83.5] },
      sensitivity: { value: 65.22, interval: [53.4, 75.4] },
      specificity: { value: 87.5, interval: [79.0, 92.9] },
      confusion: { truePositive: 45, falseNegative: 24, trueNegative: 77, falsePositive: 11 },
    },
    agreement: 120,
    disagreements: 37,
  },
  tests: [
    { key: "accuracy", label: "Overall accuracy", test: "Exact paired McNemar test", p: 0.099, significant: false, interpretation: "The observed accuracy difference is not statistically significant." },
    { key: "sensitivity", label: "Anemia sensitivity", test: "Exact paired McNemar test", p: 0.0004, significant: true, interpretation: "YOLOv8-cls identifies more anemia-labeled images at the default operating point; the difference remains significant after Bonferroni adjustment." },
    { key: "specificity", label: "Normal specificity", test: "Exact paired McNemar test", p: 0.33, significant: false, interpretation: "The baseline’s higher specificity is not statistically significant." },
    { key: "auc", label: "ROC AUC", test: "Paired t-test on per-fold AUC", p: 0.71, significant: false, interpretation: "No statistically significant difference in ranking ability was established." },
  ],
  keyFinding: "At their default operating points, YOLOv8-cls missed 8 of 69 anemia-labeled images, compared with 24 for the color baseline. Overall accuracy and AUC differences were not statistically significant.",
  limitations: [
    "The study includes only 157 unique images, including 69 labeled anemia, limiting statistical power and generalizability.",
    "Labels come from the source collection; laboratory hemoglobin measurements were unavailable. Results measure agreement with those labels, not clinical diagnostic accuracy.",
    "Independent external validation has not been performed.",
    "The significant sensitivity result relies on 20 discordant anemia images and should be interpreted as a strong indication rather than a settled effect.",
    "Grad-CAM++ is a qualitative interpretability check, not proof that the model has learned a clinically valid signal.",
  ],
  futureWork: [
    "Collect and describe an independent conjunctival-image cohort for external validation.",
    "Evaluate against laboratory-confirmed hemoglobin measurements before making claims of clinical diagnostic performance.",
    "Further investigate sensitivity–specificity trade-offs when selecting classification thresholds.",
  ],
  sourceCodeUrl: "https://github.com/PranavS1109/conjunctival-anemia-screening",
  paperFile: "/research-paper.pdf",
  demo: {
    simulated: true,
    disclaimer: "Simulated research demonstration. These example outputs are not predictions from a trained model and must not be used for medical decisions.",
    integrationNote: "The paper describes binary classification without severity grading or confidence scores. This website has no connected model or inference API.",
  },
};
