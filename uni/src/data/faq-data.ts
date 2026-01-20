export interface FAQItem {
  question: string;
  answer: string;
}

// Pre-defined FAQ sets for different page types
export const universityFAQs = (universityName: string, location: string): FAQItem[] => [
  {
    question: `What are the entry requirements for ${universityName}?`,
    answer: `Entry requirements for ${universityName} vary by course. Most undergraduate courses require A-levels with grades ranging from AAA to BBB, or equivalent qualifications. International students may need to provide IELTS scores (typically 6.0-7.0). Check the university website for specific course requirements.`,
  },
  {
    question: `What is student life like at ${universityName}?`,
    answer: `${universityName} offers a vibrant student experience in ${location}. Students can join numerous societies and sports clubs, attend regular events, and enjoy the local area's cultural offerings. The Students' Union provides support services and organizes social activities throughout the year.`,
  },
  {
    question: `What accommodation options are available at ${universityName}?`,
    answer: `${universityName} offers a range of accommodation options including catered and self-catered halls of residence. First-year students are typically guaranteed university accommodation if they apply by the deadline. Private rentals are also available in ${location}.`,
  },
  {
    question: `How do I apply to ${universityName}?`,
    answer: `Applications for full-time undergraduate courses are made through UCAS. The deadline for most courses is 31 January, with earlier deadlines for medicine, dentistry, and Oxford/Cambridge applications. You'll need to write a personal statement and provide academic references.`,
  },
];

export const academicRankingFAQs: FAQItem[] = [
  {
    question: "How are UK universities ranked academically?",
    answer: "UK universities are ranked using multiple metrics including teaching quality, student satisfaction, graduate employment rates, research quality, and student-to-staff ratios. The Guardian University Guide, Times Higher Education, and Complete University Guide each use slightly different methodologies.",
  },
  {
    question: "What does the Guardian ranking measure?",
    answer: "The Guardian University Guide measures satisfaction with teaching, satisfaction with assessment and feedback, student-to-staff ratio, expenditure per student, average entry tariff, value added score, career prospects after 15 months, and continuation rates. It focuses on the student experience rather than research metrics.",
  },
  {
    question: "How often are university rankings updated?",
    answer: "Major UK university rankings are typically updated annually. The Guardian publishes in September, Times Higher Education World Rankings in October, and the Complete University Guide in June. Rankings can change significantly year-to-year based on updated data.",
  },
  {
    question: "Should I choose a university based solely on rankings?",
    answer: "While rankings provide useful information, they shouldn't be your only consideration. Also consider the specific course content, location, campus facilities, student support services, accommodation options, and whether the university culture suits your learning style and goals.",
  },
];

export const sportsRankingFAQs: FAQItem[] = [
  {
    question: "What makes a university good for sports?",
    answer: "Top sports universities typically have excellent facilities (gyms, pitches, swimming pools), competitive varsity teams, BUCS (British Universities & Colleges Sport) success, sports scholarships, flexible timetabling for athletes, and strong coaching support. Loughborough, Bath, and Durham consistently rank highest.",
  },
  {
    question: "What is BUCS and how does it work?",
    answer: "BUCS (British Universities & Colleges Sport) is the national governing body for university sport. Universities compete in BUCS leagues and championships across 50+ sports. Points are awarded for participation and success, with an overall BUCS ranking published annually reflecting a university's sporting prowess.",
  },
  {
    question: "Can I get a sports scholarship at a UK university?",
    answer: "Many UK universities offer sports scholarships or performance programmes for talented athletes. These typically include financial support, access to elite facilities, sports science support, and flexible academic arrangements. Each university has different criteria and application processes.",
  },
  {
    question: "Do I need to be an elite athlete to enjoy university sport?",
    answer: "Not at all. All UK universities offer recreational sports alongside competitive teams. You can join intramural leagues, fitness classes, and social sports clubs regardless of ability. University is a great time to try new sports or continue activities you enjoy casually.",
  },
];

export const satisfactionRankingFAQs: FAQItem[] = [
  {
    question: "What is the National Student Survey (NSS)?",
    answer: "The NSS is an annual survey of final-year undergraduate students in the UK. It asks about satisfaction with teaching quality, assessment and feedback, academic support, organization and management, learning resources, learning community, and student voice. Results are published publicly.",
  },
  {
    question: "Why does student satisfaction matter?",
    answer: "High student satisfaction often indicates quality teaching, good support services, responsive administration, and a positive campus culture. Satisfied students are more likely to complete their degrees, achieve better grades, and recommend their university to others.",
  },
  {
    question: "Which universities have the highest student satisfaction?",
    answer: "Smaller, specialized institutions often top satisfaction rankings as they can provide more personalized attention. However, many larger research universities also achieve high scores through quality teaching and strong student support. The specific course also significantly affects satisfaction.",
  },
  {
    question: "How is student satisfaction measured?",
    answer: "The NSS uses a scale of 1-5 for each question, with 4 and 5 considered 'satisfied'. The overall satisfaction percentage represents the proportion of students who agreed or strongly agreed with positive statements about their experience. Response rates vary between institutions.",
  },
];
