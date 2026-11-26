export const PART5_DP_QUESTIONS = [
  {
    "num": 33,
    "id": "CR-33",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Dễ",
    "title": "Chi phí nhỏ nhất leo cầu thang n bậc",
    "staticSummary": "DP Bottom-Up hoặc Top-Down O(n)",
    "prompt": "Một cầu thang có n bậc đánh số từ 1 đến n, mỗi bậc i có chi phí bước lên là cost[i]. Bắt đầu đứng ở mặt đất (bậc 0 với chi phí 0), mỗi bước bạn có thể nhảy lên 1 bậc hoặc 2 bậc. Khi đặt chân lên bậc thứ i, bạn phải trả thêm chi phí cost[i]. Hãy dùng Quy hoạch động tìm tổng chi phí nhỏ nhất để đi tới đúng bậc n (tức phải bước vào bậc n).",
    "requirements": [
      "Sử dụng phương pháp Quy hoạch động (Tabulation hoặc Memoization) với độ phức tạp O(n).",
      "Không dùng đệ quy thuần O(2^n) không lưu bảng nhớ.",
      "Sử dụng kiểu long long để tránh tràn số với n lớn."
    ],
    "inputSpec": "Dòng 1: số nguyên dương n. Dòng 2: n số nguyên cost[1], cost[2], ..., cost[n].",
    "outputSpec": "Một số nguyên (long long) là chi phí nhỏ nhất để lên tới bậc n.",
    "constraints": [
      "1 <= n <= 10^5",
      "0 <= cost[i] <= 10^6"
    ],
    "example": {
      "note": "Đi theo lộ trình 0 -> 2 (15) -> 4 (5) -> 5 (10), tổng chi phí = 30.",
      "input": "5\n10 15 20 5 10",
      "output": "30"
    },
    "relatedTopics": [
      {
        "id": "7-5",
        "label": "7.5 Quy hoạch động Bottom-Up Tabulation O(n)"
      },
      {
        "id": "7-12",
        "label": "7.12 Mô hình Leo cầu thang & Tối ưu trượt 2 biến O(1)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Hệ thức truy hồi chuẩn: dp[0] = 0, dp[1] = cost[1], và với i >= 2 thì dp[i] = cost[i] + min(dp[i - 1], dp[i - 2]). Vì mỗi bước chỉ nhìn lùi 2 trạng thái liền trước, ta có thể tối ưu bộ nhớ từ O(n) xuống O(1) chỉ bằng 2 biến trượt prev2, prev1!",
    "relatedQuestions": [
      "CR-34",
      "CR-36"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n\n    long long *cost = (long long *)malloc((n + 1) * sizeof(long long));\n    long long *dp = (long long *)malloc((n + 1) * sizeof(long long));\n\n    for (int i = 1; i <= n; i++) scanf(\"%lld\", &cost[i]);\n\n    dp[0] = 0;\n    dp[1] = cost[1];\n    for (int i = 2; i <= n; i++) {\n        long long best = (dp[i - 1] < dp[i - 2]) ? dp[i - 1] : dp[i - 2];\n        dp[i] = cost[i] + best;\n    }\n\n    printf(\"%lld\\n\", dp[n]);\n    free(cost);\n    free(dp);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Tại i = 1: đứng từ mặt đất (dp[0] = 0) bước lên bậc 1 tốn prev1 = cost[1].",
      "Với i >= 2: bậc i có thể đến từ bậc i - 1 hoặc i - 2 nên cur = cost[i] + min(prev1, prev2), đạt O(n) thời gian và O(1) bộ nhớ."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h"
      ],
      "requiredApis": [
        "long long"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Sử dụng kiểu long long tránh tràn khi tổng chi phí lên tới 10^11",
          "regex": "long\\s+long",
          "flags": ""
        },
        {
          "desc": "Chuyển trạng thái so sánh min giữa bậc i-1 và i-2",
          "regex": "<|\\?",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 7 — Quy hoạch động tuyến tính 1 chiều (Tabulation O(n) · Mục 7.5, 7.12).",
      "lineByLine": [
        {
          "lines": "Dòng 13–14",
          "code": "dp[0] = 0; dp[1] = cost[1];",
          "explain": "Cơ sở DP: mặt đất bậc 0 tốn 0; muốn lên bậc 1 chỉ có 1 cách bước từ 0 → tốn cost[1]."
        },
        {
          "lines": "Dòng 15–18",
          "code": "dp[i] = cost[i] + min(dp[i - 1], dp[i - 2]);",
          "explain": "Để bước tới đúng bậc i, bước cuối cùng chỉ có thể xuất phát từ bậc i - 1 hoặc i - 2 → chọn nhánh rẻ hơn rồi cộng cost[i]."
        }
      ],
      "testCases": [
        {
          "name": "n = 5: [10, 15, 20, 5, 10]",
          "caseDesc": "0 → 2 → 4 → 5",
          "howHandled": "dp = [0, 10, 15, 30, 20, 30] → in 30."
        },
        {
          "name": "n = 1",
          "caseDesc": "1 / 42",
          "howHandled": "Vòng for i=2..1 không chạy → in dp[1] = 42."
        },
        {
          "name": "n = 10^5, cost = 10^6",
          "caseDesc": "Tổng lên tới 5*10^10",
          "howHandled": "Dùng mảng long long động tránh tràn int và tràn stack."
        }
      ],
      "examRecipe": [
        "Cấp phát mảng long long cost[n+1], dp[n+1].",
        "Đặt dp[0] = 0; dp[1] = cost[1].",
        "Lặp i = 2..n: dp[i] = cost[i] + min(dp[i - 1], dp[i - 2]).",
        "In dp[n] và free mảng."
      ]
    }
  },
  {
    "num": 34,
    "id": "CR-34",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Dễ",
    "title": "Bài toán Cắt thanh gỗ tối đa doanh thu (Rod Cutting)",
    "staticSummary": "DP Memoization hoặc Tabulation O(n^2)",
    "prompt": "Cho một thanh gỗ có chiều dài n và bảng giá p[1..n], trong đó p[i] là giá bán của một đoạn gỗ dài i (1 <= i <= n). Hãy sử dụng Quy hoạch động (Top-Down Memoization hoặc Bottom-Up Tabulation) xác định tổng doanh thu lớn nhất có thể thu được bằng cách cắt thanh gỗ thành các đoạn có độ dài nguyên (hoặc để nguyên không cắt).",
    "requirements": [
      "Cài đặt bằng Quy hoạch động (O(n^2)); không dùng đệ quy vét cạn O(2^n).",
      "Lưu trữ giá trị trung gian bằng kiểu long long."
    ],
    "inputSpec": "Dòng 1: số nguyên dương n. Dòng 2: n số nguyên p_1, p_2, ..., p_n.",
    "outputSpec": "Một số nguyên (long long) là doanh thu tối đa có thể đạt được.",
    "constraints": [
      "1 <= n <= 2000",
      "0 <= p_i <= 10^6"
    ],
    "example": {
      "note": "Với n = 8, phương án cắt thành 2 + 6 thu p[2] + p[6] = 5 + 17 = 22.",
      "input": "8\n1 5 8 9 10 17 17 20",
      "output": "22"
    },
    "relatedTopics": [
      {
        "id": "7-7",
        "label": "7.7 Phân tích Hệ thức Truy hồi Rod Cutting"
      },
      {
        "id": "7-8",
        "label": "7.8 So sánh Vét cạn O(2^n) vs Quy hoạch động O(n^2)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Hệ thức chuẩn CLRS: r[0] = 0; với j = 1..n, r[j] = max_{1 <= i <= j} (p[i] + r[j - i]). Trường hợp giữ nguyên không cắt tự động nằm ở lượt i = j (p[j] + r[0] = p[j]).",
    "relatedQuestions": [
      "CR-39",
      "CR-50"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n\nlong long p[2005], dp[2005];\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    for (int i = 1; i <= n; i++) scanf(\"%lld\", &p[i]);\n\n    dp[0] = 0;\n    for (int j = 1; j <= n; j++) {\n        long long best = 0;\n        for (int i = 1; i <= j; i++) {\n            if (p[i] + dp[j - i] > best) {\n                best = p[i] + dp[j - i];\n            }\n        }\n        dp[j] = best;\n    }\n\n    printf(\"%lld\\n\", dp[n]);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Đánh chỉ số 1-based (mảng kích thước n + 1, r[0] = 0) khớp hoàn toàn với công thức p[i] + r[j - i] và loại bỏ mọi lỗi lệch chỉ số.",
      "Bottom-Up Tabulation O(n^2) với n = 2000 chỉ tốn ~2 triệu phép cộng, chạy trong < 3 ms không tốn stack đệ quy."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h"
      ],
      "requiredApis": [
        "long long"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Vòng lặp lồng nhau O(n^2) hoặc bảng nhớ Memoization",
          "regex": "for[\\s\\S]*for|memo",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 7 — Bài toán Cắt thanh gỗ kinh điển (Rod Cutting Bottom-Up O(n^2) · Mục 7.7, 7.8 · Slide APT07).",
      "lineByLine": [
        {
          "lines": "Dòng 10–19",
          "code": "dp[j] = max_{1 <= i <= j} (p[i] + dp[j - i])",
          "explain": "Thử mọi độ dài đoạn cắt đầu tiên i từ 1 đến j (khi i == j nghĩa là để nguyên không cắt), cộng giá bán p[i] với doanh thu tối ưu phần còn lại dp[j - i]."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ sách CLRS / Slide APT07",
          "caseDesc": "n = 8: 1 5 8 9 10 17 17 20",
          "howHandled": "Cắt 2 + 6 được 5 + 17 = 22."
        },
        {
          "name": "n = 2000, p_i = 10^6",
          "caseDesc": "Doanh thu tối đa 2*10^9",
          "howHandled": "O(n^2) = 4*10^6 phép tính chạy < 10ms, dùng long long không tràn."
        }
      ],
      "examRecipe": [
        "Mảng long long p[2005], dp[2005]; đặt dp[0] = 0.",
        "Vòng ngoài j = 1..n, vòng trong i = 1..j: lấy max của p[i] + dp[j - i].",
        "In dp[n]."
      ]
    }
  },
  {
    "num": 35,
    "id": "CR-35",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Dễ",
    "title": "Đếm số đường đi trên lưới M x N có vật cản",
    "staticSummary": "DP Tabulation 2D (hoặc 1D); chia lấy dư 1000000007",
    "prompt": "Cho một lưới chữ nhật kích thước M x N. Ô (i, j) mang giá trị 0 nếu trống (đi qua được) và mang giá trị 1 nếu có vật cản. Xuất phát từ ô góc trên trái (1, 1), mỗi bước chỉ được di chuyển sang phải một ô hoặc xuống dưới một ô. Dùng Quy hoạch động đếm số đường đi khác nhau từ (1, 1) đến ô góc dưới phải (M, N) theo modulo 1000000007. Nếu ô (1, 1) hoặc (M, N) bị chặn thì kết quả là 0.",
    "requirements": [
      "Sử dụng Quy hoạch động với độ phức tạp O(M * N).",
      "Lấy phần dư cho 1000000007 tại mọi phép cộng chuyển trạng thái để không tràn số.",
      "Kiểm tra biên vật cản tại ô xuất phát (1, 1) và ô đích (M, N)."
    ],
    "inputSpec": "Dòng 1: hai số nguyên M N. M dòng tiếp theo: mỗi dòng N số thuộc {0, 1}.",
    "outputSpec": "Một số nguyên là số đường đi hợp lệ modulo 1000000007.",
    "constraints": [
      "1 <= M, N <= 500"
    ],
    "example": {
      "note": "Ô giữa hàng 2 bị chặn (giá trị 1), còn lại 4 đường đi hợp lệ từ (1,1) đến (3,4).",
      "input": "3 4\n0 0 0 0\n0 1 0 0\n0 0 0 0",
      "output": "4"
    },
    "relatedTopics": [
      {
        "id": "7-10",
        "label": "7.10 Tối ưu mảng 1 chiều và xử lý điều kiện biên DP"
      },
      {
        "id": "7-12",
        "label": "7.12 Mô hình Đếm đường đi trên lưới có vật cản modulo 10^9+7"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Ô trống (i, j) nhận đường đi từ ô ngay phía trên (i - 1, j) và ô ngay bên trái (i, j - 1): dp[j] = (dp[j] + dp[j - 1]) % MOD; nếu gặp vật cản (val == 1) thì đặt ngay dp[j] = 0!",
    "relatedQuestions": [
      "CR-33",
      "CR-37"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n\nconst long long MOD = 1000000007LL;\nint grid[505][505];\nlong long dp[505][505];\n\nint main() {\n    int M, N;\n    scanf(\"%d %d\", &M, &N);\n\n    for (int i = 1; i <= M; i++)\n        for (int j = 1; j <= N; j++) scanf(\"%d\", &grid[i][j]);\n\n    if (grid[1][1] == 1 || grid[M][N] == 1) {\n        printf(\"0\\n\");\n        return 0;\n    }\n\n    dp[1][1] = 1;\n    for (int i = 1; i <= M; i++) {\n        for (int j = 1; j <= N; j++) {\n            if (i == 1 && j == 1) continue;\n            if (grid[i][j] == 1) {\n                dp[i][j] = 0;\n            } else {\n                dp[i][j] = (dp[i - 1][j] + dp[i][j - 1]) % MOD;\n            }\n        }\n    }\n\n    printf(\"%lld\\n\", dp[M][N]);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Mảng trượt 1 chiều dp[j] tự động giữ giá trị hàng trên dp[i - 1][j]; khi cộng thêm dp[j - 1] (ô bên trái vừa tính ở cùng hàng i), ta thu được đúng dp[i][j] chỉ với O(N) bộ nhớ!",
      "Nếu ô xuất phát (0, 0) hoặc ô đích (M - 1, N - 1) có cell == 1, nhánh if (cell == 1) dp[j] = 0 tự động triệt tiêu số đường về 0 chính xác."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h"
      ],
      "requiredApis": [
        "1000000007"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Chia lấy dư theo hằng số 1000000007",
          "regex": "1000000007",
          "flags": ""
        },
        {
          "desc": "Đặt số đường đi bằng 0 tại các ô có vật cản (cell == 1)",
          "regex": "==\\s*1[\\s\\S]{0,40}=\\s*0",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 7 — Quy hoạch động trên lưới 2D có vật cản kèm modulo 10^9 + 7 (Mục 7.12).",
      "lineByLine": [
        {
          "lines": "Dòng 14–17",
          "code": "if (grid[1][1] == 1 || grid[M][N] == 1) in 0",
          "explain": "Kiểm tra biên: nếu ô xuất phát hoặc ô đích bị chặn thì không có đường đi nào."
        },
        {
          "lines": "Dòng 19–29",
          "code": "Dùng chỉ số 1-based: hàng 0 và cột 0 mặc định bằng 0",
          "explain": "Đánh số từ 1..M và 1..N giúp không phải viết if riêng cho hàng đầu hay cột đầu! Tại ô trống: dp[i][j] = (dp[i-1][j] + dp[i][j-1]) % MOD."
        }
      ],
      "testCases": [
        {
          "name": "Lưới 3x4 có vật cản tại (2,2)",
          "caseDesc": "Ví dụ đề bài",
          "howHandled": "In đúng 4."
        },
        {
          "name": "Ô (1,1) hoặc (M,N) có vật cản",
          "caseDesc": "Bị chặn ngay đầu hoặc đích",
          "howHandled": "Trả ngay 0."
        },
        {
          "name": "Lưới 500x500 không vật cản",
          "caseDesc": "Số đường đi cực lớn",
          "howHandled": "Lấy % 1000000007 tại mọi phép cộng nên không bao giờ tràn."
        }
      ],
      "examRecipe": [
        "Khai báo mảng toàn cục (tự động = 0) đánh số 1-based: grid[505][505], dp[505][505].",
        "Nếu grid[1][1] == 1 || grid[M][N] == 1 → in 0.",
        "dp[1][1] = 1; duyệt i=1..M, j=1..N: ô có vật cản đặt dp[i][j] = 0, ô trống đặt (dp[i-1][j] + dp[i][j-1]) % 1000000007."
      ]
    }
  },
  {
    "num": 36,
    "id": "CR-36",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Trung bình",
    "title": "Bài toán Đổi tiền xu ít đồng nhất (Coin Change)",
    "staticSummary": "DP Tabulation O(n * S); tránh tràn khi cộng INF",
    "prompt": "Cho n mệnh giá đồng xu c_1, c_2, ..., c_n (mỗi loại mệnh giá có thể sử dụng nhiều lần không giới hạn) và số tiền cần đổi S. Hãy dùng Quy hoạch động tìm số lượng đồng xu tối thiểu để tổng mệnh giá đúng bằng S. Nếu không thể ghép được đúng số tiền S, in -1 (với S = 0, kết quả là 0).",
    "requirements": [
      "Sử dụng Quy hoạch động (Bottom-Up Tabulation) với độ phức tạp O(n * S).",
      "Không dùng chiến lược tham lam (tham lam cho kết quả sai với nhiều bộ mệnh giá như [1, 5, 7], S = 11).",
      "Cẩn thận không để giá trị vô cực INF bị tràn khi cộng thêm 1."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n S. Dòng 2: n số nguyên c_1, ..., c_n.",
    "outputSpec": "Một số nguyên là số đồng xu ít nhất cần dùng (hoặc -1 nếu vô nghiệm).",
    "constraints": [
      "1 <= n <= 100",
      "0 <= S <= 10^5",
      "1 <= c_i <= 10^5"
    ],
    "example": {
      "note": "Với mệnh giá [1, 5, 7] và S = 11: phương án tối ưu là 5 + 5 + 1 (3 đồng), tốt hơn tham lam 7 + 1 + 1 + 1 + 1 (5 đồng).",
      "input": "3 11\n1 5 7",
      "output": "3"
    },
    "relatedTopics": [
      {
        "id": "7-5",
        "label": "7.5 Bài toán Đổi xu mẫu mực trong Slide Chương 7"
      },
      {
        "id": "7-12",
        "label": "7.12 Unbounded Coin Change & Kỹ thuật chọn INF = S + 1 chống tràn"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Bẫy kinh điển khi khởi tạo dp[x] = INT_MAX là biểu thức dp[x - c] + 1 sẽ bị tràn số nguyên âm (-2147483648), làm hàm min chọn sai toàn bộ bảng! Hãy đặt INF = S + 1 (vì đổi số tiền S bằng đồng >= 1 không bao giờ quá S đồng).",
    "relatedQuestions": [
      "CR-33",
      "CR-37"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n\nconst int INF = 1000000000;\nint c[105];\nint dp[100005];\n\nint main() {\n    int n, S;\n    scanf(\"%d %d\", &n, &S);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &c[i]);\n\n    dp[0] = 0;\n    for (int s = 1; s <= S; s++) dp[s] = INF;\n\n    for (int s = 1; s <= S; s++) {\n        for (int i = 0; i < n; i++) {\n            if (c[i] <= s && dp[s - c[i]] + 1 < dp[s]) {\n                dp[s] = dp[s - c[i]] + 1;\n            }\n        }\n    }\n\n    if (dp[S] >= INF) printf(\"-1\\n\");\n    else printf(\"%d\\n\", dp[S]);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Chọn hằng vô cực inf = S + 1 vừa gọn nhẹ vừa tuyệt đối không bao giờ tràn số khi tính dp[x - c] + 1.",
      "Vòng lặp trong chạy XUÔI từ x = c lên S vì mỗi mệnh giá đồng xu được phép lấy lặp lại nhiều lần (Unbounded)."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h"
      ],
      "requiredApis": [
        "for"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Xử lý trường hợp không đổi được tiền (in -1) và S = 0 (in 0)",
          "regex": "-\\s*1",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Khởi tạo dp bằng INT_MAX rồi cộng trực tiếp dp[x - c] + 1 không kiểm tra sẽ gây tràn số âm!",
          "regex": "INT_MAX[\\s\\S]*dp\\s*\\[[^\\]]+\\]\\s*\\+\\s*1\\s*<",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 7 — Bài toán Đổi tiền xu ít đồng nhất (Coin Change Tabulation O(n * S) · Mục 7.12).",
      "lineByLine": [
        {
          "lines": "Dòng 3",
          "code": "const int INF = 1000000000;",
          "explain": "Chọn INF = 10^9 (không dùng INT_MAX!) để phép cộng INF + 1 không bao giờ bị tràn số nguyên âm."
        },
        {
          "lines": "Dòng 12–13",
          "code": "dp[0] = 0; dp[1..S] = INF;",
          "explain": "Đổi 0 đồng tốn 0 xu; mọi số tiền khác ban đầu coi như chưa đổi được."
        },
        {
          "lines": "Dòng 15–21",
          "code": "dp[s] = min(dp[s], dp[s - c[i]] + 1)",
          "explain": "Thử chọn mỗi mệnh giá c[i] <= s làm đồng xu cuối cùng; vì xu dùng không giới hạn nên tham chiếu thẳng dp[s - c[i]]."
        }
      ],
      "testCases": [
        {
          "name": "Bộ xu bẫy Tham lam",
          "caseDesc": "n=3, S=11: [1, 5, 7]",
          "howHandled": "DP tìm ra 5 + 5 + 1 = 3 xu (thay vì tham lam 5 xu)."
        },
        {
          "name": "S = 0",
          "caseDesc": "Không cần đổi xu nào",
          "howHandled": "dp[0] = 0 → in 0."
        },
        {
          "name": "Vô nghiệm",
          "caseDesc": "S = 3, xu = [2, 4]",
          "howHandled": "dp[3] giữ nguyên INF → in -1."
        }
      ],
      "examRecipe": [
        "Đặt INF = 1000000000 (tránh INT_MAX + 1 bị tràn).",
        "dp[0] = 0; dp[1..S] = INF.",
        "Lặp s = 1..S, lặp i = 0..n-1: nếu c[i] <= s và dp[s - c[i]] + 1 < dp[s] thì cập nhật.",
        "Nếu dp[S] >= INF in -1, ngược lại in dp[S]."
      ]
    }
  },
  {
    "num": 37,
    "id": "CR-37",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Trung bình",
    "title": "Bài toán Balo 0/1 (0/1 Knapsack)",
    "staticSummary": "DP Memoization hoặc Tabulation 0/1 Knapsack",
    "prompt": "Có n đồ vật, đồ vật thứ i có khối lượng w_i và giá trị v_i. Một chiếc balo có sức chứa tối đa W. Mỗi đồ vật chỉ được chọn toàn bộ (1 lần) hoặc không chọn (0 lần). Dùng Quy hoạch động tìm tổng giá trị lớn nhất có thể mang trong balo mà tổng khối lượng không vượt quá W.",
    "requirements": [
      "Sử dụng Quy hoạch động (Top-Down Memoization hoặc Bottom-Up Tabulation) cho 0/1 Knapsack.",
      "Lưu ý mỗi đồ vật chỉ được chọn tối đa 1 lần (không nhầm sang Unbounded Knapsack).",
      "Dùng kiểu long long cho giá trị tổng."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n W. n dòng tiếp theo: mỗi dòng gồm 2 số nguyên w_i v_i.",
    "outputSpec": "Một số nguyên (long long) là tổng giá trị lớn nhất đạt được.",
    "constraints": [
      "1 <= n <= 200",
      "0 <= W <= 10^4",
      "1 <= w_i <= 10^4",
      "0 <= v_i <= 10^6"
    ],
    "example": {
      "note": "Chọn vật 2 (w=20, v=100) và vật 3 (w=30, v=120) đạt tổng khối lượng 50 và tổng giá trị 220.",
      "input": "3 50\n10 60\n20 100\n30 120",
      "output": "220"
    },
    "relatedTopics": [
      {
        "id": "7-11",
        "label": "7.11 Bài toán Cái túi 0/1 (0/1 Knapsack) & Bẫy duyệt ngược mảng 1D"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khi tối ưu không gian xuống mảng 1 chiều dp[0..W], vòng lặp sức chứa c bắt buộc phải chạy NGƯỢC từ W về w_i (c--). Nếu chạy xuôi như bài Đổi xu (Câu 36), một đồ vật sẽ bị bỏ vào balo nhiều lần!",
    "relatedQuestions": [
      "CR-36",
      "CR-44",
      "CR-46"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n\nlong long dp[10005];\n\nint main() {\n    int n, W;\n    scanf(\"%d %d\", &n, &W);\n\n    for (int i = 0; i < n; i++) {\n        int w;\n        long long v;\n        scanf(\"%d %lld\", &w, &v);\n\n        for (int j = W; j >= w; j--) {\n            if (dp[j - w] + v > dp[j]) {\n                dp[j] = dp[j - w] + v;\n            }\n        }\n    }\n\n    printf(\"%lld\\n\", dp[W]);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Cấp phát bằng calloc(W + 1, sizeof(long long)) khởi tạo toàn bộ dp[0..W] = 0 trong O(W) bộ nhớ.",
      "Vòng lặp c = W lùi về w đọc giá trị dp[c - w] của hàng i - 1 chưa bị ghi đè, đảm bảo mỗi đồ vật chỉ được xét tối đa 1 lần."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h"
      ],
      "requiredApis": [
        "long long"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Duyệt ngược trọng lượng (c--) trên mảng 1D hoặc dùng bảng 2D dp[i][c]",
          "regex": "--|\\[\\s*\\w+\\s*\\]\\s*\\[\\s*\\w+\\s*\\]",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 7 — Bài toán Balo 0/1 tối ưu bộ nhớ 1 chiều (0/1 Knapsack · Mục 7.11).",
      "lineByLine": [
        {
          "lines": "Dòng 3",
          "code": "long long dp[10005];",
          "explain": "Mảng toàn cục tự khởi tạo bằng 0: dp[j] là tổng giá trị lớn nhất với sức chứa tối đa j."
        },
        {
          "lines": "Dòng 14–18",
          "code": "for (int j = W; j >= w; j--)",
          "explain": "BẮT BUỘC DUYỆT NGƯỢC từ W xuống w! Nhờ đó dp[j - w] luôn là trạng thái trước khi xét vật hiện tại → mỗi vật chỉ được chọn tối đa 1 lần (0 hoặc 1)."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ chuẩn",
          "caseDesc": "n=3, W=50: (10,60), (20,100), (30,120)",
          "howHandled": "Chọn vật 2 + vật 3 → 100 + 120 = 220."
        },
        {
          "name": "W = 0 hoặc mọi vật nặng hơn W",
          "caseDesc": "Không chọn được vật nào",
          "howHandled": "dp[W] = 0 → in 0."
        }
      ],
      "examRecipe": [
        "Mảng toàn cục long long dp[10005] (mặc định = 0).",
        "Đọc từng vật (w, v) → chạy vòng ngược for (int j = W; j >= w; j--).",
        "Cập nhật dp[j] = max(dp[j], dp[j - w] + v).",
        "Cuối cùng in dp[W]."
      ]
    }
  },
  {
    "num": 38,
    "id": "CR-38",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Trung bình",
    "title": "Chuỗi con chung dài nhất (LCS) kèm truy vết chuỗi kết quả",
    "staticSummary": "DP Bottom-Up 2D + Traceback chuẩn (dp[i-1][j] > dp[i][j-1] đi lên, else đi trái)",
    "prompt": "Cho hai chuỗi ký tự không chứa khoảng trắng X (độ dài m) và Y (độ dài n). Hãy dùng Quy hoạch động lập bảng dp[0..m][0..n] tính độ dài Chuỗi con chung dài nhất (LCS) và truy vết chuỗi LCS theo quy tắc chuẩn: bắt đầu từ (m, n), khi i > 0 và j > 0: nếu X[i-1] == Y[j-1] thì thêm ký tự này vào đầu chuỗi kết quả và lùi về (i-1, j-1); ngược lại, nếu dp[i-1][j] > dp[i][j-1] thì giảm i (đi lên), còn lại giảm j (đi sang trái). In độ dài LCS trên dòng 1 và chuỗi LCS trên dòng 2 (nếu độ dài bằng 0, dòng 2 in EMPTY).",
    "requirements": [
      "Cài đặt bảng Quy hoạch động 2D O(m * n) và hàm truy vết nghiệm đúng theo quy tắc ưu tiên hướng đi trên để đảm bảo kết quả duy nhất.",
      "Xử lý đúng trường hợp không có ký tự chung (in 0 ở dòng 1 và EMPTY ở dòng 2).",
      "Không dùng đệ quy thuần O(2^(m+n))."
    ],
    "inputSpec": "Dòng 1: chuỗi X. Dòng 2: chuỗi Y.",
    "outputSpec": "Dòng 1: độ dài LCS. Dòng 2: chuỗi LCS truy vết được (hoặc EMPTY nếu độ dài bằng 0).",
    "constraints": [
      "1 <= |X|, |Y| <= 1000",
      "X, Y chỉ chứa chữ cái ASCII in được, không khoảng trắng"
    ],
    "example": {
      "note": "Truy vết đúng quy tắc dp[i-1][j] > dp[i][j-1] đi lên, còn lại đi trái cho ra duy nhất chuỗi ACDE.",
      "input": "ACDBE\nABCDE",
      "output": "4\nACDE"
    },
    "relatedTopics": [
      {
        "id": "7-9",
        "label": "7.9 Nguyên lý Truy vết Nghiệm (Solution Reconstruction)"
      },
      {
        "id": "7-11",
        "label": "7.11 Bảng DP 2 chiều và Truy vết Xâu con chung dài nhất (LCS)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Đọc thật kỹ quy ước phá hòa (tie-breaking) của đề bài khi truy vết! Ở bài này, đề quy định rõ: \"nếu dp[i-1][j] > dp[i][j-1] thì giảm i, còn lại giảm j\" — tức dùng dấu LỚN HƠN NGHIÊM NGẶT (>), khi bằng nhau sẽ rẽ trái (j--)!",
    "relatedQuestions": [
      "CR-39",
      "CR-47"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <string.h>\n\nchar X[1005], Y[1005];\nint dp[1005][1005];\nchar lcs[1005];\n\nint main() {\n    scanf(\"%s %s\", X, Y);\n    int m = strlen(X);\n    int n = strlen(Y);\n\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (X[i - 1] == Y[j - 1]) {\n                dp[i][j] = dp[i - 1][j - 1] + 1;\n            } else if (dp[i - 1][j] > dp[i][j - 1]) {\n                dp[i][j] = dp[i - 1][j];\n            } else {\n                dp[i][j] = dp[i][j - 1];\n            }\n        }\n    }\n\n    int len = dp[m][n];\n    printf(\"%d\\n\", len);\n\n    if (len == 0) {\n        printf(\"EMPTY\\n\");\n        return 0;\n    }\n\n    int i = m, j = n, pos = len;\n    lcs[pos] = '\\0';\n    while (i > 0 && j > 0) {\n        if (X[i - 1] == Y[j - 1]) {\n            lcs[--pos] = X[i - 1];\n            i--;\n            j--;\n        } else if (dp[i - 1][j] > dp[i][j - 1]) {\n            i--;\n        } else {\n            j--;\n        }\n    }\n\n    printf(\"%s\\n\", lcs);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Đặt mảng tĩnh dp[1005][1005] ở vùng nhớ BSS (~4 MB) tránh hoàn toàn nguy cơ tràn Stack (Stack Overflow) so với khai báo mảng cục bộ trong main().",
      "Tuân thủ chính xác điều kiện else if (dp[i - 1][j] > dp[i][j - 1]) i--; else j--; và nhánh len == 0 in \"EMPTY\"."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h",
        "string.h"
      ],
      "requiredApis": [
        "strlen",
        "EMPTY"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Xử lý in EMPTY khi độ dài LCS bằng 0",
          "regex": "EMPTY",
          "flags": ""
        },
        {
          "desc": "Truy vết theo đúng quy tắc so sánh nghiêm ngặt dp[i-1][j] > dp[i][j-1]",
          "regex": "dp\\s*\\[\\s*i\\s*-\\s*1\\s*\\]\\s*\\[\\s*j\\s*\\]\\s*>\\s*dp\\s*\\[\\s*i\\s*\\]\\s*\\[\\s*j\\s*-\\s*1\\s*\\]",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng >= thay vì > trong bước truy vết sẽ rẽ hướng khác quy ước đề bài khi dp[i-1][j] == dp[i][j-1]!",
          "regex": "else\\s+if\\s*\\(\\s*dp\\s*\\[\\s*i\\s*-\\s*1\\s*\\]\\s*\\[\\s*j\\s*\\]\\s*>=\\s*dp\\s*\\[\\s*i\\s*\\]\\s*\\[\\s*j\\s*-\\s*1\\s*\\]\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 7 — Chuỗi con chung dài nhất (LCS) 2D kèm truy vết chuẩn duy nhất (Mục 7.11).",
      "lineByLine": [
        {
          "lines": "Dòng 13–23",
          "code": "Lập bảng dp[m+1][n+1]",
          "explain": "Nếu X[i-1] == Y[j-1] thì cộng 1 từ ô chéo dp[i-1][j-1]; ngược lại lấy max giữa ô trên dp[i-1][j] và ô trái dp[i][j-1]."
        },
        {
          "lines": "Dòng 28–31",
          "code": "if (len == 0) { printf(\"EMPTY\\n\"); return 0; }",
          "explain": "Xử lý đúng quy ước khi hai chuỗi không có ký tự chung nào."
        },
        {
          "lines": "Dòng 35–45",
          "code": "Truy vết ngược từ (m, n): if (dp[i-1][j] > dp[i][j-1]) i--; else j--;",
          "explain": "Tuân thủ chính xác quy tắc ưu tiên hướng đi của đề bài (đi lên chỉ khi > hẳn, hòa thì đi trái) và ghi ngược vào lcs[--pos] để thu đúng thứ tự xuôi."
        }
      ],
      "testCases": [
        {
          "name": "ACDBE và ABCDE",
          "caseDesc": "Có nhiều LCS độ dài 4",
          "howHandled": "Theo quy tắc dp[i-1][j] > dp[i][j-1] đi lên, ngược lại đi trái → ra đúng \"4\\nACDE\"."
        },
        {
          "name": "Không có ký tự chung",
          "caseDesc": "ABC và XYZ",
          "howHandled": "len = 0 → in \"0\\nEMPTY\"."
        }
      ],
      "examRecipe": [
        "Mảng toàn cục dp[1005][1005] để không tràn stack.",
        "Lập bảng O(m*n): bằng nhau → dp[i-1][j-1]+1; khác nhau → max(trên, trái).",
        "In dp[m][n]; nếu == 0 in EMPTY và dừng.",
        "Truy vết từ (m, n): khớp → ghi lcs[--pos], i--, j--; else if (dp[i-1][j] > dp[i][j-1]) i--; else j--."
      ]
    }
  },
  {
    "num": 39,
    "id": "CR-39",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Khó",
    "title": "Cắt thanh gỗ mở rộng (Extended Rod Cutting - truy vết các đoạn cắt)",
    "staticSummary": "DP Extended Bottom-Up Cut-Rod; cập nhật nghiêm ngặt > để duy trì s[j] nhỏ nhất khi hòa",
    "prompt": "Cho thanh gỗ dài n và bảng giá p[1..n]. Hãy cài đặt thuật toán Extended Bottom-Up Cut-Rod để vừa tìm doanh thu tối đa r[n], vừa ghi nhận kích thước đoạn cắt đầu tiên tối ưu s[j] với j = 1..n. Khi duyệt i từ 1 đến j, chỉ cập nhật q = p[i] + r[j - i] và s[j] = i khi giá trị mới lớn hơn hẳn q hiện tại (điều kiện nghiêm ngặt >), nhờ vậy nếu có nhiều cách cắt cùng doanh thu thì ưu tiên độ dài đoạn đầu nhỏ nhất. Sau đó truy vết theo s[n], s[n - s[n]], ... cho đến khi hết thanh gỗ.",
    "requirements": [
      "Sử dụng Quy hoạch động O(n^2) lưu đồng thời mảng doanh thu r[] và mảng lựa chọn đoạn đầu s[].",
      "Dùng điều kiện so sánh nghiêm ngặt (>) khi duyệt i = 1..j để truy vết khớp chuẩn quy ước thuật toán.",
      "Không in khoảng trắng dư ở cuối dòng thứ hai."
    ],
    "inputSpec": "Dòng 1: số nguyên dương n. Dòng 2: n số nguyên p_1, p_2, ..., p_n.",
    "outputSpec": "Dòng 1: một số nguyên (long long) là doanh thu tối đa r[n]. Dòng 2: dãy độ dài các đoạn cắt theo đúng thứ tự truy vết từ s[], cách nhau 1 dấu cách.",
    "constraints": [
      "1 <= n <= 2000",
      "0 <= p_i <= 10^6"
    ],
    "example": {
      "note": "Với n = 7: cả 1+6 (1+17=18) và 2+2+3 (5+5+8=18) đều thu 18; nhờ dấu > nghiêm ngặt, s[7] = 1 -> in \"1 6\".",
      "input": "7\n1 5 8 9 10 17 17",
      "output": "18\n1 6"
    },
    "relatedTopics": [
      {
        "id": "7-9",
        "label": "7.9 Extended Cut-Rod, Mảng s[j] & Sửa lỗi Slide 18 (s[j] = i)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Bài toán kiểm tra trực tiếp kiến thức trọng tâm Slide 17–18 Chương 7: lưu s[j] = i (tuyệt đối không gõ nhầm s[i] = i!) dưới điều kiện p[i] + r[j - i] > q, sau đó lặp while (cur > 0) in s[cur] và lùi cur -= s[cur].",
    "relatedQuestions": [
      "CR-34",
      "CR-38",
      "CR-50"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n\nlong long p[2005], r[2005];\nint s[2005];\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    for (int i = 1; i <= n; i++) scanf(\"%lld\", &p[i]);\n\n    r[0] = 0;\n    for (int j = 1; j <= n; j++) {\n        long long q = -1;\n        for (int i = 1; i <= j; i++) {\n            if (p[i] + r[j - i] > q) {\n                q = p[i] + r[j - i];\n                s[j] = i;\n            }\n        }\n        r[j] = q;\n    }\n\n    printf(\"%lld\\n\", r[n]);\n\n    int cur = n;\n    int first = 1;\n    while (cur > 0) {\n        if (!first) printf(\" \");\n        printf(\"%d\", s[cur]);\n        first = 0;\n        cur -= s[cur];\n    }\n    printf(\"\\n\");\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Lưu s[j] = i ngay khi cand > q (nghiêm ngặt >) đảm bảo khi có nhiều nhát cắt cho cùng doanh thu tối đa, nhát cắt nhỏ nhất xuất hiện trước luôn được giữ nguyên.",
      "Vòng lặp truy vết O(n) sử dụng cờ first để in dấu cách ngăn cách chính xác mà không bao giờ dư khoảng trắng ở cuối dòng."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h"
      ],
      "requiredApis": [
        "while",
        "long long"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Lưu nhát cắt tối ưu vào s[j] = i (hoặc s[n] = i) và truy vết lùi -= s[...]",
          "regex": "s\\s*\\[\\s*\\w+\\s*\\]\\s*=\\s*i",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Gõ nhầm s[i] = i (lỗi in ấn trên slide gốc) sẽ làm hỏng toàn bộ mảng truy vết!",
          "regex": "\\bs\\s*\\[\\s*i\\s*\\]\\s*=\\s*i\\s*;",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 7 — Extended Bottom-Up Cut-Rod kèm truy vết đoạn cắt tối ưu s[] (Mục 7.9 · Slide APT07 Slide 17–18).",
      "lineByLine": [
        {
          "lines": "Dòng 14–19",
          "code": "if (p[i] + r[j - i] > q) { q = p[i] + r[j - i]; s[j] = i; }",
          "explain": "HAI ĐIỂM SỐNG CÒN: (1) Phải dùng p[i] + r[j - i] (KHÔNG dùng r[i] + r[j - i] như lỗi ở file đề cũ!) để s[j] luôn là 1 đoạn nguyên bán trực tiếp; (2) Dùng dấu `>` nghiêm ngặt nên khi hòa doanh thu sẽ ưu tiên giữ độ dài đoạn đầu nhỏ nhất."
        },
        {
          "lines": "Dòng 25–33",
          "code": "while (cur > 0) { in s[cur]; cur -= s[cur]; }",
          "explain": "Truy vết liên tục độ dài đoạn cắt đầu tiên cho phần gỗ còn lại cur; biến cờ first giúp không in khoảng trắng thừa cuối dòng."
        }
      ],
      "testCases": [
        {
          "name": "n = 7: [1, 5, 8, 9, 10, 17, 17]",
          "caseDesc": "Có nhiều cách cắt đạt 18 (1+6 hoặc 2+2+3)",
          "howHandled": "Với dấu `>`, i = 1 được cập nhật đầu tiên → s[7] = 1, s[6] = 6 → in \"18\\n1 6\"."
        },
        {
          "name": "Không cắt (để nguyên là tối ưu nhất)",
          "caseDesc": "n = 3: [1, 2, 100]",
          "howHandled": "s[3] = 3 → in \"100\\n3\"."
        }
      ],
      "examRecipe": [
        "Mảng long long p[2005], r[2005] và int s[2005]; r[0] = 0.",
        "Lặp j = 1..n: q = -1; lặp i = 1..j: nếu p[i] + r[j - i] > q thì cập nhật q và s[j] = i; gán r[j] = q.",
        "In r[n], rồi vòng while (cur > 0) in s[cur] và trừ cur -= s[cur] (không dư dấu cách cuối)."
      ]
    }
  },
  {
    "num": 40,
    "id": "CR-40",
    "part": "Quy hoạch động",
    "partLabel": "Phần 5 · Lập trình Quy hoạch động (Dynamic Programming)",
    "difficulty": "Khó",
    "title": "Lập lịch công việc có trọng số không chồng lấn (Weighted Interval Scheduling)",
    "staticSummary": "DP + sắp xếp thời điểm kết thúc + tìm kiếm nhị phân O(n log n)",
    "prompt": "Một CPU tại mỗi thời điểm chỉ thực hiện được tối đa một tiến trình. Cho n tiến trình, tiến trình thứ i có thời điểm bắt đầu s_i, thời điểm kết thúc f_i (s_i < f_i) và giá trị lợi nhuận p_i. Hai tiến trình i và j không chồng lấn nếu f_i <= s_j hoặc f_j <= s_i. Hãy sử dụng Quy hoạch động (kết hợp sắp xếp tăng dần theo f_i và tìm kiếm nhị phân tìm tiến trình gần nhất kết thúc trước s_i) để tìm tổng lợi nhuận tối đa có thể đạt được.",
    "requirements": [
      "Sử dụng Quy hoạch động (khuyến khích O(n log n) bằng qsort theo thời điểm kết thúc + binary search).",
      "Không dùng thuật toán tham lam chọn theo lợi nhuận cao nhất hoặc kết thúc sớm nhất (vì có thể sai nghiệm).",
      "Dùng kiểu long long cho tổng lợi nhuận."
    ],
    "inputSpec": "Dòng 1: số nguyên n. n dòng tiếp theo: mỗi dòng gồm 3 số nguyên s_i f_i p_i.",
    "outputSpec": "Một số nguyên (long long) là tổng lợi nhuận lớn nhất.",
    "constraints": [
      "1 <= n <= 10^4",
      "0 <= s_i < f_i <= 10^9",
      "1 <= p_i <= 10^6"
    ],
    "example": {
      "note": "Chọn tiến trình (1, 4, 5) và (4, 7, 4) không chồng lấn (f_1 = 4 <= s_4 = 4) đạt lợi nhuận 5 + 4 = 9 > 8.",
      "input": "5\n1 4 5\n3 5 1\n0 6 8\n4 7 4\n3 8 6",
      "output": "9"
    },
    "relatedTopics": [
      {
        "id": "7-4",
        "label": "7.4 Cấu trúc con tối ưu khi sắp xếp theo thời điểm kết thúc f_i"
      },
      {
        "id": "7-12",
        "label": "7.12 Lập lịch công việc có trọng số O(n log n) bằng qsort + Binary Search"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Sau khi sắp xếp f_1 <= f_2 <= ... <= f_n, các thời điểm kết thúc đã đơn điệu tăng nên ta dùng Tìm kiếm nhị phân O(log n) tìm chỉ số lớn nhất k < i thỏa f_k <= s_i. Hệ thức DP: dp[i] = max(dp[i - 1], p_i + dp[k]), đạt tổng thời gian chuẩn O(n log n).",
    "relatedQuestions": [
      "CR-36",
      "CR-37"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    long long s, f, p;\n} Job;\n\nJob jobs[10005];\nlong long dp[10005];\n\nint cmp_job(const void *a, const void *b) {\n    const Job *x = (const Job *)a;\n    const Job *y = (const Job *)b;\n    if (x->f < y->f) return -1;\n    if (x->f > y->f) return 1;\n    return 0;\n}\n\nint find_prev(int idx) {\n    int lo = 1, hi = idx - 1, ans = 0;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (jobs[mid].f <= jobs[idx].s) {\n            ans = mid;\n            lo = mid + 1;\n        } else {\n            hi = mid - 1;\n        }\n    }\n    return ans;\n}\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    for (int i = 1; i <= n; i++) {\n        scanf(\"%lld %lld %lld\", &jobs[i].s, &jobs[i].f, &jobs[i].p);\n    }\n\n    qsort(jobs + 1, n, sizeof(Job), cmp_job);\n\n    dp[0] = 0;\n    for (int i = 1; i <= n; i++) {\n        int prev = find_prev(i);\n        long long take = jobs[i].p + dp[prev];\n        long long skip = dp[i - 1];\n        dp[i] = (take > skip) ? take : skip;\n    }\n\n    printf(\"%lld\\n\", dp[n]);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Hàm so sánh cmp_jobs dùng phép so sánh (ja->f < jb->f ? -1 : 1) thay vì phép trừ ja->f - jb->f để an toàn tuyệt đối trước lỗi tràn số khi f_i lên tới 10^9.",
      "Chặt nhị phân O(log n) kết hợp mảng 1-based dp[0..n] cho độ phức tạp tối ưu O(n log n) thời gian và O(n) bộ nhớ."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "stdio.h",
        "stdlib.h"
      ],
      "requiredApis": [
        "qsort",
        "long long"
      ],
      "forbiddenApis": [],
      "qualityRules": [
        {
          "desc": "Tìm kiếm nhị phân (lo <= hi, mid) đạt O(n log n)",
          "regex": "\\bmid\\b|\\bhigh\\b|\\bhi\\b",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 7 — Lập lịch công việc có trọng số không chồng lấn (Weighted Interval Scheduling O(n log n) · Mục 7.12).",
      "lineByLine": [
        {
          "lines": "Dòng 11–17",
          "code": "qsort(jobs + 1, n, sizeof(Job), cmp_job)",
          "explain": "Sắp xếp các công việc jobs[1..n] tăng dần theo thời điểm kết thúc f_i (so sánh bằng < và > thay vì trừ để không bao giờ tràn số khi f_i tới 10^9!)."
        },
        {
          "lines": "Dòng 19–31",
          "code": "find_prev(idx) bằng tìm kiếm nhị phân",
          "explain": "Tìm chỉ số lớn nhất mid < idx thỏa mãn jobs[mid].f <= jobs[idx].s (tương thích không chồng lấn). Trả về 0 nếu không có công việc nào kết thúc trước."
        },
        {
          "lines": "Dòng 42–48",
          "code": "dp[i] = max(dp[i - 1], jobs[i].p + dp[prev])",
          "explain": "Tại công việc thứ i có 2 lựa chọn: bỏ qua (skip = dp[i-1]) hoặc chọn nó cộng lợi nhuận tốt nhất trước đó (take = p_i + dp[prev])."
        }
      ],
      "testCases": [
        {
          "name": "5 công việc chồng lấn",
          "caseDesc": "(1,4,5), (3,5,1), (0,6,8), (4,7,4), (3,8,6)",
          "howHandled": "Chọn (1,4,5) + (4,7,4) = 9 (tốt hơn chọn đơn lẻ 8)."
        },
        {
          "name": "Chạm mốc f_i == s_j",
          "caseDesc": "f_1 = 4, s_2 = 4",
          "howHandled": "Điều kiện <= coi là không chồng lấn đúng đề bài."
        }
      ],
      "examRecipe": [
        "Lưu 1-based vào Job jobs[10005] và qsort(jobs + 1, n, ...) theo f tăng dần.",
        "Viết find_prev(i) tìm nhị phân công việc cuối có f <= jobs[i].s (trả 0 nếu không có).",
        "dp[0] = 0; lặp i = 1..n: dp[i] = max(dp[i - 1], jobs[i].p + dp[find_prev(i)]).",
        "In dp[n]."
      ]
    }
  }
];
