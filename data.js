const surveyQuestions = [
  {
    id: 1,
    type: "single",
    question: {
      sv: "Vad tycker du är den viktigaste frågan för kåren att förbättra på campus?",
      en: "What is the most important issue for improving the physical campus environment?"
    },
    options: {
      sv: [
        "Utomhusbelysning på kvällar och mornar",
        "Förbättra den fysiska arbetsmiljön såsom ventilationen.",
        "Bättre tillgänglighetsanpassningar",
        "Ge tillgång till barnpassning för studenter med barnansvar",
        "Fler mikrovågsugnar och fräschare studentkök"
      ],
      en: [
        "Outdoor lighting in mornings and evenings",
        "Improve the physical work environment (e.g. ventilation)",
        "Better accessibility adaptations",
        "Provide childcare for students with children",
        "More microwaves and improved student kitchens"
      ]
    }
  },
  {
    id: 2,
    type: "required",
    question: {
      sv: "Tycker du att kåren ska ta ställning i internationella konflikter?",
      en: "Should the student union take positions on international conflicts?"
    },
    options: {
      sv: [
        "Ja, universitet är en internationell miljö och vad som händer i omvärlden påverkar oss alla",
        "Ja, men SUS bör prioritera frågor som har en tydlig koppling till studentperspektivet.",
        "Nej, fokuset bör endast ligga på frågor om att förbättra saker på campus och för SUs studenter.",
        "Nej, det riskerar att polarisera studenterna.",
        "Ja, att inte ta ställning är att stå på förtryckarnas sida."
      ],
      en: [
        "Yes, universities are international environments and global events affect us all",
        "Yes, but SUS should prioritize issues clearly connected to the student perspective",
        "No, focus should only be on improving campus and conditions for SU students",
        "No, it risks polarizing students",
        "Yes, not taking a stance means siding with oppression"
      ]
    }
  },
  {
    id: 3,
    type: "single",
    question: {
      sv: "Vad är din syn på SUS som konsument och om att delta i bojkotter?",
      en: "What is your view on SUS as a consumer and on participating in boycotts?"
    },
    options: {
      sv: [
        "Positiv, både för SUS och vi bör driva på gentemot universitetet",
        "Positiv, SUS är stor aktör som kan påverka genom konsumentmakt",
        "Negativ, det tar bort fokus från kärnuppdraget",
        "Något positiv, men bör utföras selektivt"
      ],
      en: [
        "Positive, both for SUS itself and as a policy it should encourage the university to adopt",
        "Positive, SUS is a large actor that can influence through consumer power",
        "Negative, it distracts from the core mission",
        "Somewhat positive, but it should be done selectively"
      ]
    }
  },
  {
    id: 4,
    type: "ranking",
    question: {
      sv: "I vilken ordning skulle du prioritera följande högskolepolitiska frågor?",
      en: "In what order would you rank the following higher education policy issues?"
    },
    options: {
      sv: [
        "Förändra regler kring CSN och gör det mer flexibelt",
        "Reformera Akademiska hus",
        "Minska hyresnivåer på studentbostäder genom att slopa regler för nybyggnation",
        "Stoppa utvisningar av blivande studenter",
        "Höja CSN",
        "Reformera bostadsbidraget så att fler kan ta del"
      ],
      en: [
        "Make student finance (CSN) more flexible",
        "Reform Akademiska Hus (state-owned property company)",
        "Reduce student housing rents by easing construction regulations",
        "Stop deportations of prospective students",
        "Increase student financial aid (CSN)",
        "Reform housing benefits so that more students are eligible"
      ]
    }
  },
  {
    id: 5,
    type: "ranking",
    question: {
      sv: "I vilken ordning skulle du ranka följande initiativ för att förbättra Stockholm som studentstad?",
      en: "In what order would you rank the following initiatives for making Stockholm a better city for students?"
    },
    options: {
      sv: [
        "Sänkta hyror för studentbostäder i Stockholm",
        "Bättre kommunikationer mellan SUs olika campus",
        "Frysta hyror för studentbostäder i Stockholm",
        "Bättre studentbostäder, höj standarden",
        "Bättre studentrabatt på SL-biljetter",
        "Ökad byggtakt för studentbostäder i Stockholm"
      ],
      en: [
        "Lower rents for student housing in Stockholm",
        "Better transport between SU campuses",
        "Freeze student housing rents in Stockholm",
        "Improve student housing quality",
        "Better student discounts on public transport (SL)",
        "Increase construction of student housing in Stockholm"
      ]
    }
  },
  {
    id: 6,
    type: "single",
    question: {
      sv: "Vad är viktigast för dig som medlem att din studentkår står för?",
      en: "What is most important to you that your student union stands for?"
    },
    options: {
      sv: [
        "För att genom samverkan förbättra tillgängligheten och tillgången till studier på SU",
        "Värna den akademiska friheten och stoppa vänstervridningen av SU",
        "För att verka för ett tryggare campus",
        "En kårpolitik som präglas av jämlikhet, demokrati, feminism och antirasism",
        "Utmana kårens generella vänstervridning",
        "Lyfta den internationella solidariteten på SU",
        "En kår som verkar för en jämlik studietid"
      ],
      en: [
        "To improve access to and conditions for studies at SU through cooperation",
        "Defend academic freedom and counter left-wing bias at SU",
        "To promote a safer campus",
        "A student union policy based on equality, democracy, feminism and anti-racism",
        "Challenge the union’s general left-wing bias",
        "Promote international solidarity at SU",
        "A union that works for equal study conditions"
      ]
    }
  }
];
