export const step25Data = {
  "modelVersion": "JIRAMA_MADAGASCAR_MODELS_V1",
  "method": "POSITIVE_UNLABELED_BAGGING",
  "datasetYear": 2024,
  "snapshotTime": "2024-12-31 23:00:00",
  "snapshotLabel": "31/12/2024 23:00",
  "rowCount": 52566,
  "qualityChecksPassed": 9,
  "qualityChecksTotal": 9,
  "plotCount": 12,
  "scoreSemantics": "RISK_RANKING_SCORE_NOT_PROBABILITY",
  "productionReady": false,
  "readyForApiPrototype": true,
  "model1h": {
    "model": null,
    "status": "INSUFFICIENT_LOCAL_DATA"
  },
  "model6h": {
    "horizon": "6h",
    "model": "HIST_GRADIENT_BOOSTING",
    "complexity": 100,
    "rocAucProxy": 0.370185772541912,
    "averagePrecisionProxy": 0.0004573896594583,
    "incidentsEvaluated": 3,
    "forwardMeanPercentile": 85.23148148148148,
    "forwardWorstPercentile": 75.27777777777777,
    "top10Rate": 0.3333333333333333,
    "finalScore": 55.93521455302153,
    "status": "EXPERIMENTAL"
  },
  "model24h": {
    "horizon": "24h",
    "model": "RANDOM_FOREST",
    "complexity": 50,
    "rocAucProxy": 0.2748411978221415,
    "averagePrecisionProxy": 0.0018115942028985,
    "incidentsEvaluated": 3,
    "forwardMeanPercentile": 95.64814814814817,
    "forwardWorstPercentile": 93.47222222222224,
    "top10Rate": 1.0,
    "finalScore": 62.001319150366335,
    "status": "MVP_CANDIDATE"
  },
  "provinces": [
    {
      "province": "ANTANANARIVO",
      "risk6h": {
        "model": "HIST_GRADIENT_BOOSTING",
        "score": 0.0069567734913851,
        "percentile": 33.534984590800136,
        "level": "LOW",
        "status": "EXPERIMENTAL"
      },
      "risk24h": {
        "model": "RANDOM_FOREST",
        "score": 0.3894950712466443,
        "percentile": 77.19438420271658,
        "level": "LOW",
        "status": "MVP_CANDIDATE"
      },
      "planned": {
        "now": 0,
        "next1h": 0,
        "next6h": 0,
        "next24h": 0
      }
    },
    {
      "province": "ANTSIRANANA",
      "risk6h": {
        "model": "HIST_GRADIENT_BOOSTING",
        "score": 0.0069125977807459,
        "percentile": 42.40954228969296,
        "level": "LOW",
        "status": "EXPERIMENTAL"
      },
      "risk24h": {
        "model": "RANDOM_FOREST",
        "score": 0.0001567194478278,
        "percentile": 31.714416162538523,
        "level": "LOW",
        "status": "MVP_CANDIDATE"
      },
      "planned": {
        "now": 0,
        "next1h": 0,
        "next6h": 0,
        "next24h": 0
      }
    },
    {
      "province": "FIANARANTSOA",
      "risk6h": {
        "model": "HIST_GRADIENT_BOOSTING",
        "score": 0.0048940265947363,
        "percentile": 34.8533272457482,
        "level": "LOW",
        "status": "EXPERIMENTAL"
      },
      "risk24h": {
        "model": "RANDOM_FOREST",
        "score": 0.0001822502079125,
        "percentile": 70.10044515466271,
        "level": "LOW",
        "status": "MVP_CANDIDATE"
      },
      "planned": {
        "now": 0,
        "next1h": 0,
        "next6h": 0,
        "next24h": 0
      }
    },
    {
      "province": "MAHAJANGA",
      "risk6h": {
        "model": "HIST_GRADIENT_BOOSTING",
        "score": 0.0151419595389881,
        "percentile": 46.87821024997147,
        "level": "LOW",
        "status": "EXPERIMENTAL"
      },
      "risk24h": {
        "model": "RANDOM_FOREST",
        "score": 0.3849147727411238,
        "percentile": 39.801392535098735,
        "level": "LOW",
        "status": "MVP_CANDIDATE"
      },
      "planned": {
        "now": 0,
        "next1h": 0,
        "next6h": 0,
        "next24h": 0
      }
    },
    {
      "province": "TOAMASINA",
      "risk6h": {
        "model": "HIST_GRADIENT_BOOSTING",
        "score": 0.0108602798155918,
        "percentile": 22.37187535669444,
        "level": "LOW",
        "status": "EXPERIMENTAL"
      },
      "risk24h": {
        "model": "RANDOM_FOREST",
        "score": 0.4030677286753742,
        "percentile": 46.52436936422783,
        "level": "LOW",
        "status": "MVP_CANDIDATE"
      },
      "planned": {
        "now": 0,
        "next1h": 0,
        "next6h": 0,
        "next24h": 0
      }
    },
    {
      "province": "TOLIARY",
      "risk6h": {
        "model": "HIST_GRADIENT_BOOSTING",
        "score": 0.0070391166146081,
        "percentile": 39.77285697979683,
        "level": "LOW",
        "status": "EXPERIMENTAL"
      },
      "risk24h": {
        "model": "RANDOM_FOREST",
        "score": 0.0,
        "percentile": 30.92112772514553,
        "level": "LOW",
        "status": "MVP_CANDIDATE"
      },
      "planned": {
        "now": 0,
        "next1h": 0,
        "next6h": 0,
        "next24h": 0
      }
    }
  ],
  "riskDistribution": {
    "6h": {
      "LOW": {
        "rows": 42028,
        "share": 79.95282121523418
      },
      "MODERATE": {
        "rows": 7902,
        "share": 15.032530533044172
      },
      "HIGH": {
        "rows": 2108,
        "share": 4.010196705094548
      },
      "CRITICAL": {
        "rows": 528,
        "share": 1.0044515466270973
      }
    },
    "24h": {
      "LOW": {
        "rows": 42025,
        "share": 79.9471141041738
      },
      "MODERATE": {
        "rows": 7917,
        "share": 15.06106608834608
      },
      "HIGH": {
        "rows": 2098,
        "share": 3.9911730015599436
      },
      "CRITICAL": {
        "rows": 526,
        "share": 1.0006468059201765
      }
    }
  }
};

export default step25Data;
