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
      "origin": "Chương 7 — Quy hoạch động tuyến tính 1 chiều (Bottom-Up Tabulation O(n) · Mục 7.5 & 7.12 · Bài toán Leo cầu thang tối ưu chi phí).",
      "idea": {
        "summary": "Bạn xuất phát ở mặt đất (bậc 0, tốn 0 chi phí) và muốn đặt chân lên đúng bậc thứ n. Mỗi bước nhảy lên được 1 bậc hoặc 2 bậc, hễ bước lên bậc i là phải trả cost[i]. Thay vì thử mọi lộ trình nhảy (số lượng tăng theo hàm mũ), ta tính lần lượt chi phí rẻ nhất để đến từng bậc 1, 2, ..., n dựa vào kết quả của đúng 2 bậc liền trước đã tính sẵn.",
        "steps": [
          "Bước 1 — Định nghĩa trạng thái DP: Gọi dp[i] (kiểu long long) là tổng chi phí nhỏ nhất để đi từ mặt đất (bậc 0) tới và đứng trên đúng bậc i (0 ≤ i ≤ n).",
          "Bước 2 — Xác định điều kiện cơ sở (Base Cases): Ở bậc 0 chưa bước lên bậc nào nên dp[0] = 0. Để bước tới bậc 1 chỉ có duy nhất một cách nhảy 1 bậc từ bậc 0 nên dp[1] = cost[1].",
          "Bước 3 — Lập công thức chuyển trạng thái (Recurrence): Với mọi i ≥ 2, trước khi đặt chân lên bậc i, bước nhảy cuối cùng chỉ có thể xuất phát từ bậc i − 1 (nhảy 1 bậc) hoặc bậc i − 2 (nhảy 2 bậc). Do đó: dp[i] = cost[i] + min(dp[i − 1], dp[i − 2]).",
          "Bước 4 — Thứ tự tính Bottom-Up: Vì dp[i] chỉ phụ thuộc vào dp[i − 1] và dp[i − 2] (các chỉ số nhỏ hơn), ta dùng một vòng lặp for chạy xuôi i từ 2 đến n để điền kín bảng dp[].",
          "Bước 5 — Trả kết quả & dọn bộ nhớ: Vì đề yêu cầu phải bước vào đúng bậc n, đáp án chính là dp[n] (không lấy min(dp[n], dp[n-1])!). Cuối cùng gọi free() giải phóng hai mảng động."
        ],
        "whyThisWay": "Nếu dùng đệ quy thuần f(i) = cost[i] + min(f(i-1), f(i-2)) mà không lưu bảng nhớ, cùng một bậc sẽ bị tính đi tính lại theo cây Fibonacci, làm độ phức tạp bùng nổ O(2^n) (chỉ với n = 50 đã treo máy). Nếu dùng Tham lam (đứng ở bậc i luôn chọn nhảy sang bậc rẻ hơn giữa i+1 và i+2), ta dễ sập bẫy cục bộ — ví dụ cost = [10, 15, 20, 5, 10]: từ 0 tham lam chọn 1 (10 < 15), rồi từ 1 chọn 2 (15 < 20)... tốn nhiều hơn đường tối ưu 0 → 2 → 4 → 5 (= 30). Quy hoạch động giải quyết trọn vẹn cả hai bẫy chỉ trong O(n).",
        "complexity": "Thời gian: O(n) (một vòng lặp duy nhất) · Bộ nhớ: O(n) trên Heap (~1.6 MB với n = 10^5; có thể tối ưu xuống O(1) nếu chỉ giữ 2 biến trượt)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–2",
          "title": "Khai báo thư viện chuẩn C",
          "code": "#include <stdio.h>\n#include <stdlib.h>",
          "explain": "Thư viện <stdio.h> cung cấp hàm nhập/xuất chuẩn scanf() và printf(). Thư viện <stdlib.h> cung cấp hai hàm quản lý bộ nhớ động trên vùng nhớ Heap là malloc() và free(). Nếu quên #include <stdlib.h>, trình biên dịch sẽ báo lỗi/cảnh báo ngầm định hàm malloc và có thể cắt cụt con trỏ 64-bit gây crash (Segmentation Fault)."
        },
        {
          "lines": "Dòng 4–6",
          "title": "Khởi đầu hàm main và đọc số bậc cầu thang n",
          "code": "int main() {\n    int n;\n    scanf(\"%d\", &n);",
          "explain": "Biến n kiểu int đủ chứa tối đa 10^5 (int 32-bit chứa tới ~2.1×10^9). Hàm scanf(\"%d\", &n) đọc số nguyên từ bàn phím (stdin) và lưu vào địa chỉ vùng nhớ của biến n thông qua toán tử lấy địa chỉ `&`. Quên dấu `&` là lỗi kinh điển của người mới học C, sẽ gây lỗi truy cập bộ nhớ ngay lập tức."
        },
        {
          "lines": "Dòng 8–9",
          "title": "Cấp phát động mảng cost và dp kiểu long long trên Heap",
          "code": "long long *cost = (long long *)malloc((n + 1) * sizeof(long long));\nlong long *dp = (long long *)malloc((n + 1) * sizeof(long long));",
          "explain": "Ta cấp phát kích thước (n + 1) phần tử để đánh chỉ số từ 0 đến n (bậc 0 là mặt đất, bậc 1..n là cầu thang). Phải dùng kiểu long long (64-bit, chứa tới ~9×10^18) vì khi n = 10^5 và cost[i] = 10^6, tổng chi phí tối đa đạt khoảng 5×10^10, vượt xa giới hạn ~2.1×10^9 của kiểu int! Dùng malloc() cấp phát trên Heap thay vì mảng cục bộ long long dp[n+1] giúp tránh tràn Stack (Stack Overflow) khi n lớn. Biểu thức sizeof(long long) trả về 8 byte mỗi phần tử."
        },
        {
          "lines": "Dòng 11",
          "title": "Nhập chi phí từng bậc theo chỉ số 1-based",
          "code": "for (int i = 1; i <= n; i++) scanf(\"%lld\", &cost[i]);",
          "explain": "Vòng lặp chạy từ i = 1 đến n để khớp tự nhiên với phát biểu đề bài \"bậc đánh số từ 1 đến n\". Chú ý dùng đặc tả định dạng \"%lld\" (long long decimal) tương ứng với kiểu long long của cost[i]; nếu viết nhầm \"%d\", dữ liệu đọc vào sẽ bị sai lệch ở 4 byte cao."
        },
        {
          "lines": "Dòng 13–14",
          "title": "Khởi tạo điều kiện cơ sở (Base Cases)",
          "code": "dp[0] = 0;\ndp[1] = cost[1];",
          "explain": "Đây là 2 trạng thái nền móng bắt buộc phải có trước khi chạy công thức truy hồi (vì công thức cần nhìn lùi i − 1 và i − 2). Ở mặt đất (bậc 0), chưa mất chi phí nên dp[0] = 0. Để đứng ở bậc 1, chỉ có duy nhất đường nhảy 1 bậc từ bậc 0 nên dp[1] = dp[0] + cost[1] = cost[1]. Đặc biệt, nếu n = 1 thì vòng lặp phía sau không chạy và dp[1] chính là đáp án đúng."
        },
        {
          "lines": "Dòng 15–18",
          "title": "Vòng lặp Bottom-Up tính công thức chuyển trạng thái",
          "code": "for (int i = 2; i <= n; i++) {\n    long long best = (dp[i - 1] < dp[i - 2]) ? dp[i - 1] : dp[i - 2];\n    dp[i] = cost[i] + best;\n}",
          "explain": "Với từng bậc i từ 2 đến n, toán tử ba ngôi `?:` tìm giá trị nhỏ hơn giữa dp[i - 1] (nhảy từ bậc ngay trước) và dp[i - 2] (nhảy cóc 2 bậc), gán vào biến trung gian `best` (nhớ dùng long long để không bị cắt số!). Sau đó cộng thêm chi phí đặt chân lên bậc hiện tại `cost[i]` để ra `dp[i]`. Mọi giá trị dp[i - 1] và dp[i - 2] đều đã được tính tối ưu ở các vòng lặp trước."
        },
        {
          "lines": "Dòng 20–24",
          "title": "In kết quả, giải phóng bộ nhớ và kết thúc chương trình",
          "code": "printf(\"%lld\\n\", dp[n]);\nfree(cost);\nfree(dp);\nreturn 0;\n}",
          "explain": "In đáp án `dp[n]` bằng định dạng \"%lld\\n\" (luôn có ký tự xuống dòng `\\n` cho đúng chuẩn chấm bài). Gọi `free(cost)` và `free(dp)` trả lại bộ nhớ Heap cho hệ điều hành — thói quen chuẩn mực tránh rò rỉ bộ nhớ (Memory Leak). Cuối cùng `return 0;` báo với hệ điều hành chương trình kết thúc thành công."
        }
      ],
      "testCases": [
        {
          "name": "Test mẫu tiêu chuẩn (bẫy Tham lam)",
          "caseDesc": "n = 5, cost = [10, 15, 20, 5, 10].",
          "howHandled": "Bảng dp lần lượt: dp[0]=0, dp[1]=10, dp[2]=15+min(10,0)=15, dp[3]=20+min(15,10)=30, dp[4]=5+min(30,15)=20, dp[5]=10+min(20,30)=30. Lộ trình tối ưu 0 → 2 → 4 → 5, in 30."
        },
        {
          "name": "Biên nhỏ nhất n = 1",
          "caseDesc": "n = 1, cost = [42].",
          "howHandled": "Gán dp[0] = 0, dp[1] = 42. Vòng lặp for (i = 2; i <= 1; i++) không thực hiện lần nào. Chương trình in thẳng dp[1] = 42, không truy cập ngoài mảng."
        },
        {
          "name": "Biên n = 2 (chọn nhảy thẳng 2 bậc từ mặt đất)",
          "caseDesc": "n = 2, cost = [100, 7].",
          "howHandled": "dp[0]=0, dp[1]=100, dp[2]=7 + min(dp[1], dp[0]) = 7 + 0 = 7 (nhảy thẳng 0 → 2 bỏ qua bậc 1 đắt tiền). In đúng 7."
        },
        {
          "name": "Biên lớn chống tràn số (n = 10^5, cost[i] = 10^6)",
          "caseDesc": "Mọi bậc đều có giá 10^6, tổng chi phí tối thiểu đạt 50,000 × 10^6 = 5×10^10.",
          "howHandled": "Mọi biến cost, dp, best đều dùng long long (64-bit) và định dạng %lld, đồng thời cấp phát trên Heap nên chạy mượt O(n) trong vài mili-giây không tràn số hay tràn Stack."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo #include <stdio.h>, <stdlib.h>; đọc n rồi cấp phát động hai mảng long long kích thước (n + 1) là cost và dp.",
        "Bước 2: Đọc cost[1..n] bằng vòng for 1-based với định dạng \"%lld\".",
        "Bước 3: Đặt cứng điều kiện cơ sở: dp[0] = 0; dp[1] = cost[1];.",
        "Bước 4: Viết vòng for (int i = 2; i <= n; i++) tính dp[i] = cost[i] + min(dp[i - 1], dp[i - 2]).",
        "Bước 5: In printf(\"%lld\\n\", dp[n]);, gọi free(cost); free(dp); và return 0;."
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
      "CR-39"
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
      "origin": "Chương 7 — Bài toán Cắt thanh gỗ kinh điển (Rod Cutting Bottom-Up O(n^2) · Mục 7.7 & 7.8 · Giáo trình CLRS & Slide APT07).",
      "idea": {
        "summary": "Cho thanh gỗ dài n và bảng giá bán p[1..n] cho từng đoạn gỗ nguyên dài 1..n. Ta có quyền cắt thanh gỗ thành bao nhiêu đoạn tùy ý (hoặc để nguyên không cắt) sao cho tổng tiền bán được là lớn nhất. Tư duy Quy hoạch động là: nếu cắt đoạn đầu tiên dài i (bán ngay lấy tiền p[i]), phần gỗ còn lại dài (j − i) là một bài toán con giống hệt nhưng nhỏ hơn, ta chỉ việc tra doanh thu tối ưu đã tính sẵn là dp[j − i].",
        "steps": [
          "Bước 1 — Định nghĩa trạng thái DP: Gọi dp[j] (kiểu long long) là doanh thu lớn nhất có thể thu được từ một thanh gỗ có chiều dài j (0 ≤ j ≤ n).",
          "Bước 2 — Điều kiện cơ sở (Base Case): Thanh gỗ dài 0 không bán được đồng nào nên dp[0] = 0.",
          "Bước 3 — Lập công thức chuyển trạng thái (Recurrence): Với thanh gỗ dài j (1 ≤ j ≤ n), ta thử mọi độ dài i của đoạn cắt đầu tiên (1 ≤ i ≤ j). Tổng tiền phương án đó là p[i] + dp[j − i]. Do đó: dp[j] = max_{1 ≤ i ≤ j} (p[i] + dp[j − i]). Chú ý khi i = j, ta có p[j] + dp[0] = p[j], nghĩa là phương án \"để nguyên không cắt\" đã tự động được xét!",
          "Bước 4 — Thứ tự tính Bottom-Up: Vì để tính dp[j] ta chỉ cần các giá trị dp[0], dp[1], ..., dp[j − 1] đứng trước nó, ta cho vòng lặp ngoài j tăng dần từ 1 đến n, vòng lặp trong thử i từ 1 đến j.",
          "Bước 5 — Trả kết quả: Sau khi vòng ngoài kết thúc tại j = n, giá trị dp[n] chính là doanh thu tối đa cần tìm."
        ],
        "whyThisWay": "Một thanh gỗ dài n có (n − 1) vị trí có thể đặt vết cắt (mỗi vị trí chọn cắt hoặc không cắt), dẫn đến 2^(n-1) cách chia — nếu viết đệ quy vét cạn O(2^n) thì với n = 40 chương trình đã mất nhiều giờ. Nếu dùng Tham lam (chọn đoạn có đơn giá p[i]/i cao nhất trước) cũng sai — ví dụ p = [1, 5, 8, 9] với n = 4: đoạn dài 3 có đơn giá 8/3 ≈ 2.67 cao nhất, nhưng chọn 3 + 1 chỉ thu 8 + 1 = 9, thua xa cắt 2 + 2 thu 5 + 5 = 10. Tabulation O(n^2) chỉ tốn ~2 triệu phép toán với n = 2000, chạy chưa tới 5 ms.",
        "complexity": "Thời gian: O(n^2) (tổng số phép lặp là n(n+1)/2 ≈ 2×10^6 khi n = 2000) · Bộ nhớ: O(n) (hai mảng tĩnh p và dp kích thước 2005)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện và mảng toàn cục p, dp",
          "code": "#include <stdio.h>\n\nlong long p[2005], dp[2005];",
          "explain": "Chỉ cần <stdio.h> cho scanf/printf. Hai mảng p[2005] (lưu giá bán) và dp[2005] (lưu doanh thu tối ưu) được khai báo toàn cục với kích thước 2005 (dư so với giới hạn n ≤ 2000 để tránh lỗi tràn chỉ số biên). Mảng toàn cục nằm ở phân vùng BSS nên tự động khởi tạo bằng 0 và không chiếm dụng Stack. Dùng long long vì khi n = 2000 và p[1] = 10^6, tổng doanh thu đạt 2×10^9 (rất sát ngưỡng tràn của int 32-bit)."
        },
        {
          "lines": "Dòng 5–8",
          "title": "Đọc chiều dài n và bảng giá p[1..n]",
          "code": "int main() {\n    int n;\n    scanf(\"%d\", &n);\n    for (int i = 1; i <= n; i++) scanf(\"%lld\", &p[i]);",
          "explain": "Đọc chiều dài thanh gỗ n, sau đó đọc n mức giá vào các ô p[1], p[2], ..., p[n] (chỉ số 1-based). Đánh chỉ số từ 1 cực kỳ có lợi: p[i] ứng đúng với đoạn dài i và công thức p[i] + dp[j - i] khớp 100% với công thức toán học trong giáo trình CLRS, tránh mọi nhầm lẫn cộng/trừ 1."
        },
        {
          "lines": "Dòng 10",
          "title": "Thiết lập điều kiện cơ sở dp[0] = 0",
          "code": "dp[0] = 0;",
          "explain": "Gán tường minh dp[0] = 0 (thanh gỗ độ dài 0 có doanh thu 0). Đây là điểm neo quan trọng để khi vòng lặp xét nhát cắt i == j (không cắt thanh gỗ), phép tính p[j] + dp[0] cho ra đúng p[j]."
        },
        {
          "lines": "Dòng 11–12",
          "title": "Vòng lặp ngoài giải tuần tự từng bài toán con j = 1..n",
          "code": "for (int j = 1; j <= n; j++) {\n    long long best = 0;",
          "explain": "Vòng lặp ngoài tăng dần chiều dài thanh gỗ đang xét j từ 1 đến n (tính từ nhỏ đến lớn — Bottom-Up). Biến `best` kiểu long long lưu doanh thu tốt nhất tìm được cho thanh gỗ dài j, khởi tạo bằng 0 (hợp lệ vì đề bài đảm bảo mọi giá bán p[i] ≥ 0)."
        },
        {
          "lines": "Dòng 13–19",
          "title": "Vòng lặp trong thử mọi nhát cắt đầu tiên i = 1..j",
          "code": "    for (int i = 1; i <= j; i++) {\n        if (p[i] + dp[j - i] > best) {\n            best = p[i] + dp[j - i];\n        }\n    }\n    dp[j] = best;\n}",
          "explain": "Ta giả định đoạn gỗ đầu tiên cắt ra có độ dài i (1 ≤ i ≤ j) và bán nguyên đoạn này với giá p[i]; phần còn lại dài (j - i) đã có lời giải tối ưu nhất lưu sẵn trong dp[j - i] (vì j - i < j nên chắc chắn đã được tính ở các lượt trước!). Nếu tổng p[i] + dp[j - i] lớn hơn `best`, ta cập nhật `best`. Sau khi thử đủ mọi i từ 1 đến j, lưu kết quả tối ưu vào `dp[j] = best`."
        },
        {
          "lines": "Dòng 21–23",
          "title": "In doanh thu tối đa và kết thúc chương trình",
          "code": "    printf(\"%lld\\n\", dp[n]);\n    return 0;\n}",
          "explain": "In ra giá trị dp[n] bằng đặc tả \"%lld\\n\" (khớp kiểu long long của mảng dp) rồi trả về 0 kết thúc hàm main()."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ kinh điển giáo trình CLRS / Slide APT07",
          "caseDesc": "n = 8, p = [1, 5, 8, 9, 10, 17, 17, 20].",
          "howHandled": "dp = [0, 1, 5, 8, 10, 13, 17, 18, 22]. Tại j = 8, i = 2 cho p[2] + dp[6] = 5 + 17 = 22 (tốt hơn để nguyên p[8] = 20). In 22."
        },
        {
          "name": "Phản ví dụ Tham lam theo đơn giá p[i]/i",
          "caseDesc": "n = 4, p = [1, 5, 8, 9] (đơn giá: 1.0, 2.5, 2.67, 2.25).",
          "howHandled": "Tham lam lấy đoạn 3 + đoạn 1 chỉ được 9; DP thử đủ i=1..4 và tìm ra i=2 → p[2] + dp[2] = 5 + 5 = 10."
        },
        {
          "name": "Trường hợp biên n = 1 hoặc không nên cắt",
          "caseDesc": "n = 1, p = [7] hoặc n = 3, p = [1, 2, 100].",
          "howHandled": "Khi i = j, p[j] + dp[0] = p[j] tự động được xét: với n = 1 in 7; với [1, 2, 100] in 100."
        },
        {
          "name": "Giới hạn tối đa n = 2000, mọi p[i] = 10^6",
          "caseDesc": "Cắt thành 2000 đoạn dài 1 thu 2000 × 10^6 = 2×10^9.",
          "howHandled": "Số phép toán khoảng 2×10^6 chạy < 5 ms; dùng long long đảm bảo an toàn tuyệt đối trước ngưỡng tràn 32-bit."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo mảng toàn cục long long p[2005], dp[2005]; để tránh tràn số và dùng chỉ số 1-based.",
        "Bước 2: Đọc n và nhập p[1..n] bằng scanf(\"%lld\", &p[i]).",
        "Bước 3: Gán cơ sở dp[0] = 0;.",
        "Bước 4: Viết 2 vòng for lồng nhau: ngoài j = 1..n, khởi tạo best = 0; trong i = 1..j, cập nhật best = max(best, p[i] + dp[j - i]); cuối vòng ngoài gán dp[j] = best.",
        "Bước 5: In printf(\"%lld\\n\", dp[n]); và return 0;."
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
      "origin": "Chương 7 — Quy hoạch động đếm tổ hợp trên lưới 2D có vật cản kết hợp Modulo 10^9 + 7 (Mục 7.10 & 7.12).",
      "idea": {
        "summary": "Trên lưới chữ nhật M × N có các ô trống (0) và ô vật cản (1), bạn đi từ góc trên trái (1, 1) đến góc dưới phải (M, N) và ở mỗi bước chỉ được đi sang phải hoặc đi xuống. Để biết có bao nhiêu đường tới ô trống (i, j), ta chỉ cần nhận xét: bước cuối cùng trước khi vào (i, j) chỉ có thể đến từ ô ngay phía trên (i − 1, j) hoặc ô ngay bên trái (i, j − 1). Do đó tổng số đường đến (i, j) bằng tổng số đường đến hai ô đó (còn nếu (i, j) là vật cản thì số đường bằng 0).",
        "steps": [
          "Bước 1 — Định nghĩa trạng thái DP: Gọi dp[i][j] là số đường đi hợp lệ từ ô (1, 1) đến ô (i, j), đã lấy phần dư cho MOD = 10^9 + 7 (1 ≤ i ≤ M, 1 ≤ j ≤ N).",
          "Bước 2 — Kiểm tra biên đặc biệt & mẹo chỉ số 1-based: Nếu ô xuất phát grid[1][1] == 1 hoặc ô đích grid[M][N] == 1 thì lập tức kết luận 0 đường đi. Dùng mảng toàn cục 1-based giúp toàn bộ hàng 0 (dp[0][j]) và cột 0 (dp[i][0]) tự động mang giá trị 0, loại bỏ hoàn toàn các nhánh if kiểm tra biên trên/trái!",
          "Bước 3 — Điều kiện cơ sở (Base Case): Khi ô (1, 1) trống, có đúng 1 cách đứng tại điểm xuất phát nên đặt dp[1][1] = 1.",
          "Bước 4 — Công thức chuyển trạng thái (Recurrence): Với mọi ô (i, j) ≠ (1, 1): nếu grid[i][j] == 1 (vật cản) thì dp[i][j] = 0; ngược lại dp[i][j] = (dp[i − 1][j] + dp[i][j − 1]) % MOD.",
          "Bước 5 — Thứ tự tính & trả kết quả: Duyệt hàng i từ 1..M, trong mỗi hàng duyệt cột j từ 1..N (vì ô trên và ô trái luôn được tính xong trước ô hiện tại). Cuối cùng in dp[M][N]."
        ],
        "whyThisWay": "Nếu dùng đệ quy quay lui (DFS/Backtracking) thử rẽ phải và rẽ xuống, số đường đi trên lưới M × N không vật cản là tổ hợp C(M+N−2, M−1) tăng theo hàm mũ (với M = N = 500 số đường có gần 300 chữ số!), chạy hàng tỷ năm không xong và chắc chắn tràn mọi kiểu số nguyên nếu không chia dư từng bước. Quy hoạch động 2D cộng dồn kèm `% MOD` ngay tại mỗi ô vừa giảm thời gian xuống O(M × N) (≤ 250,000 phép cộng), vừa giữ mọi giá trị trung gian luôn nhỏ hơn 2×10^9 nên không bao giờ tràn số.",
        "complexity": "Thời gian: O(M × N) (≤ 2.5×10^5 phép toán với M, N ≤ 500) · Bộ nhớ: O(M × N) (~3 MB trên BSS cho hai mảng toàn cục grid và dp)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo hằng số MOD và hai mảng toàn cục 2D",
          "code": "#include <stdio.h>\n\nconst long long MOD = 1000000007LL;\nint grid[505][505];\nlong long dp[505][505];",
          "explain": "Hằng số `MOD = 1000000007LL` (hậu tố LL ép kiểu hằng thành long long) là số nguyên tố chuẩn trong lập trình thi đấu để lấy phần dư. Hai mảng toàn cục `grid[505][505]` và `dp[505][505]` (kích thước 505 > 500 để chứa chỉ số 0..500) nằm trong vùng nhớ BSS nên vừa tránh tràn Stack, vừa được hệ thống tự động gán toàn bộ bằng 0 — đặc biệt hữu ích vì hàng 0 (`dp[0][j]`) và cột 0 (`dp[i][0]`) sẽ mặc định bằng 0."
        },
        {
          "lines": "Dòng 7–12",
          "title": "Đọc kích thước lưới M, N và ma trận vật cản",
          "code": "int main() {\n    int M, N;\n    scanf(\"%d %d\", &M, &N);\n\n    for (int i = 1; i <= M; i++)\n        for (int j = 1; j <= N; j++) scanf(\"%d\", &grid[i][j]);",
          "explain": "Đọc số hàng M và số cột N, sau đó dùng hai vòng lặp lồng nhau đọc giá trị từng ô (0 là trống, 1 là vật cản) vào chỉ số 1-based từ (1, 1) đến (M, N). Nếu viết 0-based (0..M-1), khi tính ô ở hàng đầu hoặc cột đầu ta dễ truy cập nhầm chỉ số âm `i - 1 = -1` gây lỗi bộ nhớ."
        },
        {
          "lines": "Dòng 14–17",
          "title": "Kiểm tra nhanh trường hợp ô đầu hoặc ô đích bị chặn",
          "code": "    if (grid[1][1] == 1 || grid[M][N] == 1) {\n        printf(\"0\\n\");\n        return 0;\n    }",
          "explain": "Nếu ngay tại ô xuất phát (1, 1) đã có vật cản thì không thể bắt đầu hành trình; nếu ô đích (M, N) bị chặn thì không thể bước vào đích. Kiểm tra sớm giúp in ngay 0 và thoát sạch, đặc biệt bảo vệ đúng trường hợp lưới 1×1 có vật cản (nếu quên kiểm tra, dòng `dp[1][1] = 1` ở dưới sẽ ghi đè thành 1 sai hoàn toàn!)."
        },
        {
          "lines": "Dòng 19–22",
          "title": "Khởi tạo ô xuất phát và khung duyệt lưới 2 chiều",
          "code": "    dp[1][1] = 1;\n    for (int i = 1; i <= M; i++) {\n        for (int j = 1; j <= N; j++) {\n            if (i == 1 && j == 1) continue;",
          "explain": "Gán cơ sở `dp[1][1] = 1` (có đúng 1 cách xuất phát tại (1, 1)). Vòng lặp duyệt lần lượt từng hàng i từ 1..M, mỗi hàng duyệt từ trái sang phải j = 1..N. Dòng `if (i == 1 && j == 1) continue;` cực kỳ quan trọng: nếu bỏ qua dòng này, ô (1, 1) sẽ bị tính lại bằng `dp[0][1] + dp[1][0] = 0 + 0 = 0`, phá hỏng toàn bộ bảng DP về 0 hết!"
        },
        {
          "lines": "Dòng 23–29",
          "title": "Công thức chuyển trạng thái DP và chia dư MOD",
          "code": "            if (grid[i][j] == 1) {\n                dp[i][j] = 0;\n            } else {\n                dp[i][j] = (dp[i - 1][j] + dp[i][j - 1]) % MOD;\n            }\n        }\n    }",
          "explain": "Nếu ô (i, j) có vật cản (`grid[i][j] == 1`), không có đường nào đi qua được nên đặt `dp[i][j] = 0`. Ngược lại, số đường đi tới (i, j) bằng tổng số đường từ ô ngay trên `dp[i - 1][j]` và ô ngay bên trái `dp[i][j - 1]`. Ta lấy `% MOD` ngay tại mỗi phép cộng (theo tính chất đồng dư `(a + b) % m = ((a % m) + (b % m)) % m`) nên giá trị `dp[i][j]` luôn nằm trong [0, 10^9 + 6], tổng 2 ô không bao giờ vượt 2×10^9 + 12 và tuyệt đối không tràn `long long`."
        },
        {
          "lines": "Dòng 31–33",
          "title": "In kết quả tại ô đích (M, N) và kết thúc",
          "code": "    printf(\"%lld\\n\", dp[M][N]);\n    return 0;\n}",
          "explain": "In số đường đi hợp lệ tới ô góc dưới phải `dp[M][N]` bằng định dạng \"%lld\\n\" (vì dp có kiểu long long) rồi trả về 0."
        }
      ],
      "testCases": [
        {
          "name": "Lưới 3×4 có vật cản giữa (ví dụ đề bài)",
          "caseDesc": "M = 3, N = 4, vật cản tại ô (2, 2).",
          "howHandled": "Hàng 1: [1, 1, 1, 1]; Hàng 2: [1, 0, 1, 2]; Hàng 3: [1, 1, 2, 4] → in đúng 4."
        },
        {
          "name": "Ô xuất phát (1, 1) hoặc ô đích (M, N) có vật cản",
          "caseDesc": "Ví dụ M = 1, N = 1, grid = [[1]] hoặc lưới có grid[M][N] = 1.",
          "howHandled": "Nhánh kiểm tra đầu vào `if (grid[1][1] == 1 || grid[M][N] == 1)` bắt ngay lập tức và in 0, không bị `dp[1][1] = 1` ghi đè."
        },
        {
          "name": "Đường đi bị chặn kín hoàn toàn ở giữa lưới",
          "caseDesc": "M = 3, N = 3, toàn bộ hàng 2 là vật cản [1, 1, 1].",
          "howHandled": "Toàn bộ hàng 2 có dp = 0, kéo theo mọi ô hàng 3 đều có dp = 0 → in dp[3][3] = 0."
        },
        {
          "name": "Lưới tối đa 500×500 không có vật cản",
          "caseDesc": "Số đường thật là C(998, 499) ~ 10^299, lớn hơn giới hạn long long hàng trăm bậc.",
          "howHandled": "Mọi phép cộng đều lấy `% 1000000007LL` tức thì nên không bao giờ tràn số, tính xong trong ~2 ms."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo toàn cục `const long long MOD = 1000000007LL;`, `int grid[505][505];`, `long long dp[505][505];` (tự động = 0).",
        "Bước 2: Đọc M, N và ma trận grid theo chỉ số 1-based `1..M`, `1..N`.",
        "Bước 3: Nếu `grid[1][1] == 1 || grid[M][N] == 1` thì in `0\\n` và `return 0;` ngay.",
        "Bước 4: Đặt `dp[1][1] = 1;`, duyệt `i = 1..M`, `j = 1..N`: bỏ qua `(1, 1)` bằng `continue`; nếu `grid[i][j] == 1` gán `dp[i][j] = 0`, ngược lại gán `(dp[i - 1][j] + dp[i][j - 1]) % MOD`.",
        "Bước 5: In `printf(\"%lld\\n\", dp[M][N]);` và `return 0;`."
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
      "origin": "Chương 7 — Bài toán Đổi tiền xu ít đồng nhất (Unbounded Coin Change · Bottom-Up Tabulation O(n × S) · Mục 7.5 & 7.12).",
      "idea": {
        "summary": "Cho n loại mệnh giá tiền xu (mỗi loại có vô hạn đồng) và một số tiền cần đổi S. Mục tiêu là tìm số lượng đồng xu ít nhất có tổng mệnh giá đúng bằng S (hoặc báo -1 nếu không thể ghép). Ý tưởng Quy hoạch động là: để đổi được số tiền s với ít xu nhất, ta thử xem đồng xu cuối cùng bỏ vào là mệnh giá c[i] nào (c[i] ≤ s); khi đó phần tiền còn lại (s − c[i]) cần được đổi tối ưu trong dp[s − c[i]] đồng, tổng cộng là dp[s − c[i]] + 1 đồng.",
        "steps": [
          "Bước 1 — Định nghĩa trạng thái DP: Gọi dp[s] là số đồng xu tối thiểu cần dùng để ghép đúng số tiền s (0 ≤ s ≤ S). Nếu chưa đổi được số tiền s, ta gán dp[s] = INF (vô cực an toàn).",
          "Bước 2 — Chọn hằng số vô cực INF an toàn & Điều kiện cơ sở: Đặt INF = 10^9 (tuyệt đối KHÔNG dùng INT_MAX vì INT_MAX + 1 sẽ tràn thành số âm!). Cơ sở: đổi 0 đồng không cần xu nào nên dp[0] = 0; mọi s từ 1..S ban đầu gán dp[s] = INF.",
          "Bước 3 — Công thức chuyển trạng thái (Recurrence): Với mỗi mức tiền s tăng dần từ 1 đến S, duyệt mọi mệnh giá c[i] (0 ≤ i < n). Nếu c[i] ≤ s thì ta có phương án dùng thêm 1 đồng c[i] lên trên trạng thái s − c[i]: dp[s] = min(dp[s], dp[s − c[i]] + 1).",
          "Bước 4 — Tại sao dùng lại được nhiều xu cùng mệnh giá: Vì ta tính từ s nhỏ đến s lớn và tra trực tiếp `dp[s - c[i]]` (đã có thể chứa chính mệnh giá c[i] trước đó), mỗi loại xu tự động được sử dụng không giới hạn số lần (Unbounded).",
          "Bước 5 — Trả kết quả: Sau khi tính xong bảng, kiểm tra nếu dp[S] >= INF tức là không tồn tại cách ghép nào thì in -1; ngược lại in dp[S]."
        ],
        "whyThisWay": "Thuật toán Tham lam (luôn lấy đồng xu mệnh giá lớn nhất có thể) thất bại thảm hại với nhiều hệ tiền tệ: ví dụ mệnh giá [1, 5, 7] và S = 11, tham lam lấy 7 + 1 + 1 + 1 + 1 tốn 5 đồng, trong khi tối ưu là 5 + 5 + 1 chỉ tốn 3 đồng; thậm chí với [2, 5] và S = 6 tham lam lấy 5 rồi bế tắc tưởng vô nghiệm, trong khi 2 + 2 + 2 = 6 có nghiệm 3 đồng! Còn đệ quy vét cạn có độ phức tạp hàm mũ O(n^S). DP Bottom-Up kiểm tra toàn diện mọi tổ hợp trong thời gian đa thức O(n × S).",
        "complexity": "Thời gian: O(n × S) (≤ 100 × 10^5 = 10^7 phép toán, chạy ~15 ms) · Bộ nhớ: O(S) (~400 KB cho mảng toàn cục dp[100005])."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo hằng số INF chống tràn và mảng toàn cục",
          "code": "#include <stdio.h>\n\nconst int INF = 1000000000;\nint c[105];\nint dp[100005];",
          "explain": "Bẫy chết người của bài Đổi xu là dùng `INT_MAX` (2,147,483,647): khi đó phép tính `dp[s - c[i]] + 1` sẽ bị tràn số nguyên có dấu thành `-2147483648` (rất nhỏ!), khiến phép so sánh `< dp[s]` chọn nhầm giá trị âm và phá nát cả bảng DP! Chọn `INF = 1000000000` (10^9) vừa lớn hơn hẳn số xu tối đa (≤ 10^5), vừa đảm bảo `INF + 1 = 1000000001` hoàn toàn an toàn trong kiểu `int`. Mảng `c[105]` (n ≤ 100) và `dp[100005]` (S ≤ 10^5) đặt toàn cục để tránh tràn Stack."
        },
        {
          "lines": "Dòng 7–10",
          "title": "Đọc n, S và danh sách n mệnh giá xu",
          "code": "int main() {\n    int n, S;\n    scanf(\"%d %d\", &n, &S);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &c[i]);",
          "explain": "Đọc số lượng loại xu n, tổng tiền cần đổi S, rồi đọc lần lượt n mệnh giá vào c[0..n-1]. Các mệnh giá không nhất thiết phải được sắp xếp sẵn và cũng không cần sắp xếp vì vòng lặp DP sẽ duyệt đủ tất cả mệnh giá."
        },
        {
          "lines": "Dòng 12–13",
          "title": "Thiết lập điều kiện cơ sở và khởi gán vô cực",
          "code": "    dp[0] = 0;\n    for (int s = 1; s <= S; s++) dp[s] = INF;",
          "explain": "Đổi số tiền 0 đồng cần đúng 0 đồng xu (`dp[0] = 0`) — trường hợp biên S = 0 sẽ lập tức trả về 0 đúng yêu cầu đề. Mọi số tiền `s` từ 1 đến S ban đầu đều coi là \"chưa đổi được\" nên gán bằng `INF`. Nhờ gán `INF` (số rất lớn), phép tìm `min` phía sau mới cập nhật xuống được số xu thực tế."
        },
        {
          "lines": "Dòng 15–21",
          "title": "Vòng lặp DP Bottom-Up tính số xu tối thiểu cho từng mức tiền",
          "code": "    for (int s = 1; s <= S; s++) {\n        for (int i = 0; i < n; i++) {\n            if (c[i] <= s && dp[s - c[i]] + 1 < dp[s]) {\n                dp[s] = dp[s - c[i]] + 1;\n            }\n        }\n    }",
          "explain": "Vòng ngoài duyệt số tiền mục tiêu `s` tăng dần từ 1 đến S. Vòng trong thử từng mệnh giá `c[i]`. Điều kiện `c[i] <= s` đứng TRƯỚC toán tử `&&` (ngắn mạch — short-circuit) nhằm đảm bảo chỉ số `s - c[i]` không bao giờ âm (tránh lỗi truy cập mảng ngoài biên). Nếu `dp[s - c[i]]` là `INF` thì `INF + 1` không nhỏ hơn `INF` (hoặc bất kỳ nghiệm hữu hạn nào) nên không bao giờ cập nhật nhầm. Nếu tốt hơn `dp[s]` hiện tại thì cập nhật `dp[s] = dp[s - c[i]] + 1`."
        },
        {
          "lines": "Dòng 23–26",
          "title": "Kiểm tra vô nghiệm và in kết quả",
          "code": "    if (dp[S] >= INF) printf(\"-1\\n\");\n    else printf(\"%d\\n\", dp[S]);\n    return 0;\n}",
          "explain": "Sau khi hoàn thành bảng DP, nếu `dp[S]` vẫn giữ giá trị `>= INF` nghĩa là không có tổ hợp xu nào cộng lại bằng S, in `-1`. Ngược lại in số đồng xu ít nhất `dp[S]`. Trả về 0 kết thúc chương trình."
        }
      ],
      "testCases": [
        {
          "name": "Bộ xu bẫy Tham lam (ví dụ đề bài)",
          "caseDesc": "n = 3, S = 11, mệnh giá [1, 5, 7].",
          "howHandled": "DP tính được dp[5]=1, dp[6]=2, dp[10]=2 (5+5), dp[11]=min(dp[10]+1, dp[6]+1, dp[4]+1) = 3 (5+5+1), vượt trội hơn tham lam 5 đồng."
        },
        {
          "name": "Trường hợp biên S = 0",
          "caseDesc": "n = 3, S = 0, mệnh giá [2, 5, 10].",
          "howHandled": "dp[0] = 0; cả hai vòng lặp `for (s = 1; s <= 0; s++)` đều không chạy → `dp[0] < INF` → in đúng 0."
        },
        {
          "name": "Trường hợp vô nghiệm",
          "caseDesc": "n = 2, S = 3, mệnh giá [2, 4] (chỉ toàn số chẵn, không ghép được số lẻ).",
          "howHandled": "dp[1]=INF, dp[2]=1, dp[3] thử c=2 được dp[1]+1 = INF+1 không nhỏ hơn INF → giữ nguyên dp[3]=INF → in -1."
        },
        {
          "name": "Mệnh giá xu lớn hơn S",
          "caseDesc": "n = 2, S = 5, mệnh giá [10, 5].",
          "howHandled": "Điều kiện `c[i] <= s` chặn đứng c[0] = 10 không cho truy cập chỉ số âm `dp[5 - 10]`; mệnh giá 5 cho kết quả dp[5] = 1."
        }
      ],
      "examRecipe": [
        "Bước 1: Đặt hằng `const int INF = 1000000000;` (TUYỆT ĐỐI tránh `INT_MAX`!) và khai báo toàn cục `int c[105], dp[100005];`.",
        "Bước 2: Đọc `n`, `S` và mảng mệnh giá `c[0..n-1]`.",
        "Bước 3: Khởi tạo `dp[0] = 0;` và vòng lặp gán `dp[1..S] = INF;`.",
        "Bước 4: Lặp `s = 1..S`, lồng `i = 0..n-1`: nếu `c[i] <= s && dp[s - c[i]] + 1 < dp[s]` thì cập nhật `dp[s] = dp[s - c[i]] + 1`.",
        "Bước 5: Nếu `dp[S] >= INF` in `-1`, ngược lại in `dp[S]`."
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
      "CR-36"
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
      "origin": "Chương 7 — Bài toán Cái túi 0/1 tối ưu không gian 1 chiều (0/1 Knapsack · O(n × W) thời gian, O(W) bộ nhớ · Mục 7.11).",
      "idea": {
        "summary": "Bạn có một chiếc balo chịu được tối đa sức chứa W và n đồ vật, mỗi vật có khối lượng w_i và giá trị v_i. Mỗi đồ vật chỉ có 2 lựa chọn: lấy đúng 1 lần (1) hoặc không lấy (0) — không được chặt nhỏ và không được lấy lặp lại. Ta xét lần lượt từng đồ vật một; với mỗi sức chứa j, so sánh giữa \"không lấy vật i\" (giữ nguyên giá trị cũ) và \"lấy vật i\" (lấy giá trị tốt nhất với sức chứa còn lại j − w_i rồi cộng thêm v_i).",
        "steps": [
          "Bước 1 — Tư duy bảng 2D gốc trước khi nén 1D: Gọi F[i][j] là tổng giá trị lớn nhất khi xét i đồ vật đầu tiên với sức chứa tối đa j. Hệ thức: F[i][j] = max(F[i − 1][j], F[i − 1][j − w_i] + v_i) (nếu j ≥ w_i).",
          "Bước 2 — Nén xuống mảng 1 chiều dp[0..W]: Nhận thấy hàng thứ i chỉ phụ thuộc vào hàng liền trước (i − 1) ở cùng cột j và cột bên trái j − w_i. Do đó ta chỉ cần MỘT mảng `dp[0..W]` (khởi tạo toàn bộ bằng 0) để ghi đè dần theo từng vật.",
          "Bước 3 — Điều kiện cơ sở (Base Case): Khi chưa xét đồ vật nào (0 đồ vật), với mọi sức chứa j ∈ [0..W] giá trị tối đa đều bằng 0 (`dp[j] = 0`).",
          "Bước 4 — Quy tắc vàng DUYỆT NGƯỢC sức chứa `j = W` về `w`: Khi xét vật (w, v), ta chạy `for (int j = W; j >= w; j--)` và cập nhật `dp[j] = max(dp[j], dp[j - w] + v)`. Vì duyệt từ lớn xuống nhỏ, lúc tính `dp[j]`, ô `dp[j - w]` ở bên trái CHƯA bị cập nhật bởi vật hiện tại — nó vẫn giữ nguyên giá trị của hàng `i − 1`, đảm bảo mỗi vật chỉ được bỏ vào balo tối đa 1 lần!",
          "Bước 5 — Trả kết quả: Sau khi xét đủ n vật, `dp[W]` chính là tổng giá trị lớn nhất với sức chứa không vượt quá W (vì `dp[j]` luôn đơn điệu không giảm theo j)."
        ],
        "whyThisWay": "Nếu dùng đệ quy vét cạn chọn/không chọn mỗi vật, độ phức tạp là O(2^n) — với n = 200 là hoàn toàn bất khả thi. Nếu dùng Tham lam (chọn vật có tỉ số giá trị/khối lượng v_i/w_i lớn nhất) thì chỉ đúng cho Balo phân số (Fractional Knapsack), còn với Balo 0/1 sẽ cho kết quả sai — ví dụ W = 50 với 3 vật (10,60), (20,100), (30,120) có tỉ số 6, 5, 4: tham lam chọn vật 1 + vật 2 chỉ được 160, trong khi tối ưu là vật 2 + vật 3 được 220! Ngoài ra, nếu nén xuống mảng 1D mà lỡ chạy XUÔI `j = w..W` thì `dp[j - w]` đã chứa vật hiện tại rồi, biến sai thành Balo không giới hạn (Unbounded Knapsack — một vật bị lấy nhiều lần!).",
        "complexity": "Thời gian: O(n × W) (≤ 200 × 10^4 = 2×10^6 phép toán, chạy < 5 ms) · Bộ nhớ: O(W) (~80 KB cho một mảng long long dp[10005], giảm 200 lần so với bảng 2D)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện và mảng DP 1 chiều toàn cục",
          "code": "#include <stdio.h>\n\nlong long dp[10005];",
          "explain": "Mảng `dp[10005]` (W ≤ 10^4) được khai báo toàn cục nên mặc định toàn bộ phần tử `dp[0..10004]` đều bằng 0 — đóng vai trò sẵn trạng thái cơ sở khi chưa có đồ vật nào. Bắt buộc dùng kiểu `long long` vì với n = 200 và v_i = 10^6, tổng giá trị lên tới 2×10^8 (và với các bộ test mở rộng có thể vượt ngưỡng 32-bit)."
        },
        {
          "lines": "Dòng 5–7",
          "title": "Đọc số đồ vật n và sức chứa tối đa W",
          "code": "int main() {\n    int n, W;\n    scanf(\"%d %d\", &n, &W);",
          "explain": "Đọc hai tham số chính của bài toán: số lượng đồ vật n (1 ≤ n ≤ 200) và sức chứa tối đa của balo W (0 ≤ W ≤ 10^4)."
        },
        {
          "lines": "Dòng 9–12",
          "title": "Vòng lặp ngoài đọc trực tiếp từng đồ vật (Streaming)",
          "code": "    for (int i = 0; i < n; i++) {\n        int w;\n        long long v;\n        scanf(\"%d %lld\", &w, &v);",
          "explain": "Một lợi thế tuyệt vời của DP 1 chiều là ta thậm chí không cần tạo mảng `w[205]`, `v[205]` để lưu danh sách đồ vật! Cứ đọc từng cặp `(w, v)` của đồ vật thứ i là cập nhật ngay vào bảng `dp[]` rồi chuyển sang vật tiếp theo. Biến giá trị `v` dùng `long long` và đọc bằng `\"%lld\"` để đồng bộ kiểu khi cộng với `dp[j - w]`."
        },
        {
          "lines": "Dòng 14–19",
          "title": "Vòng lặp trong DUYỆT NGƯỢC từ W xuống w (chìa khóa của 0/1 Knapsack)",
          "code": "        for (int j = W; j >= w; j--) {\n            if (dp[j - w] + v > dp[j]) {\n                dp[j] = dp[j - w] + v;\n            }\n        }\n    }",
          "explain": "ĐÂY LÀ KHỐI CODE QUAN TRỌNG NHẤT: `j` bắt buộc chạy lùi `j--` từ `W` xuống `w`. Nhờ chạy lùi, khi đang tính `dp[j]`, phần tử `dp[j - w]` (chỉ số nhỏ hơn j) chưa bị chạm tới trong vòng lặp của vật i, nên nó chắc chắn là trạng thái cũ (không chứa vật i) → vật i chỉ được cộng thêm đúng 1 lần! Điều kiện dừng `j >= w` vừa bảo vệ chỉ số `j - w >= 0`, vừa tự động bỏ qua những vật quá nặng (`w > W`, khi đó vòng lặp không chạy lần nào). Nếu viết nhầm `for (int j = w; j <= W; j++)`, cùng một đồ vật sẽ bị bỏ vào balo lặp đi lặp lại nhiều lần!"
        },
        {
          "lines": "Dòng 21–23",
          "title": "In tổng giá trị tối đa và kết thúc chương trình",
          "code": "    printf(\"%lld\\n\", dp[W]);\n    return 0;\n}",
          "explain": "Vì `dp[j]` định nghĩa là tổng giá trị lớn nhất với sức chứa TỐI ĐA j (không bắt buộc phải đầy khít j), giá trị tại `dp[W]` luôn là giá trị lớn nhất trong toàn bộ `dp[0..W]`. In `dp[W]` bằng `\"%lld\\n\"` và `return 0;`."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ chuẩn phá bẫy Tham lam theo v/w",
          "caseDesc": "n = 3, W = 50: (10, 60), (20, 100), (30, 120).",
          "howHandled": "Sau vật 1: dp[10..50]=60. Sau vật 2: dp[20..29]=100, dp[30..50]=160. Sau vật 3: dp[50]=max(160, dp[20]+120)=220. In 220 (vượt tham lam 160)."
        },
        {
          "name": "Kiểm chứng không lấy lặp vật (bẫy duyệt xuôi)",
          "caseDesc": "n = 1, W = 10, duy nhất 1 vật (w = 3, v = 10).",
          "howHandled": "Duyệt ngược j = 10..3: mọi dp[j] đều đọc dp[j-3] = 0 nên dp[10] = 10 (đúng!). Nếu lỡ duyệt xuôi sẽ ra dp[3]=10 → dp[6]=20 → dp[9]=30 (sai vì lấy 3 lần cùng 1 vật!)."
        },
        {
          "name": "Biên sức chứa W = 0 hoặc mọi vật nặng hơn W",
          "caseDesc": "n = 2, W = 5, các vật (6, 100) và (10, 200).",
          "howHandled": "Với mọi vật, điều kiện `j >= w` sai ngay từ đầu nên vòng lặp trong không chạy → mảng dp giữ nguyên 0 → in 0."
        },
        {
          "name": "Vật có giá trị bằng 0 và tối đa n = 200, W = 10^4",
          "caseDesc": "n = 200 vật nặng nhẹ khác nhau, tổng giá trị lên tới 2×10^8.",
          "howHandled": "Độ phức tạp 2×10^6 phép toán chạy rất nhanh, kiểu long long chứa thoải mái không tràn số."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo toàn cục `long long dp[10005];` (tự khởi tạo bằng 0, chỉ tốn O(W) bộ nhớ).",
        "Bước 2: Đọc `n` và `W`.",
        "Bước 3: Chạy vòng ngoài `for (int i = 0; i < n; i++)`, đọc từng vật `w` (`int`) và `v` (`long long`).",
        "Bước 4: Chạy vòng trong DUYỆT NGƯỢC `for (int j = W; j >= w; j--)`, cập nhật `if (dp[j - w] + v > dp[j]) dp[j] = dp[j - w] + v;`.",
        "Bước 5: In `printf(\"%lld\\n\", dp[W]);` và `return 0;`."
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
      "CR-39"
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
      "origin": "Chương 7 — Chuỗi con chung dài nhất (Longest Common Subsequence — LCS) bằng bảng DP 2D kèm Truy vết nghiệm (Mục 7.9 & 7.11).",
      "idea": {
        "summary": "Cho hai chuỗi X (độ dài m) và Y (độ dài n). \"Chuỗi con\" (subsequence) là chuỗi thu được bằng cách xóa đi một số ký tự (có thể không xóa) nhưng vẫn giữ nguyên thứ tự tương đối trước-sau. Ta cần hai việc: (1) Lập bảng Quy hoạch động 2D `dp[i][j]` để tìm độ dài LCS lớn nhất, và (2) Đi ngược từ góc dưới phải `(m, n)` về `(0, 0)` theo đúng quy tắc ưu tiên hướng đi của đề bài để tái tạo ra chính xác chuỗi LCS đó.",
        "steps": [
          "Bước 1 — Định nghĩa trạng thái DP: Gọi dp[i][j] là độ dài chuỗi con chung dài nhất của tiền tố gồm i ký tự đầu của X (tức X[0..i−1]) và tiền tố gồm j ký tự đầu của Y (tức Y[0..j−1]), với 0 ≤ i ≤ m, 0 ≤ j ≤ n.",
          "Bước 2 — Điều kiện cơ sở (Base Cases): Khi một trong hai chuỗi rỗng (i = 0 hoặc j = 0) thì không có ký tự chung nào nên dp[i][0] = 0 và dp[0][j] = 0 (mảng toàn cục tự khởi tạo sẵn bằng 0).",
          "Bước 3 — Công thức chuyển trạng thái (Recurrence): Xét cặp ký tự cuối của hai tiền tố là X[i − 1] và Y[j − 1]: (a) Nếu X[i − 1] == Y[j − 1], ký tự này chắc chắn kéo dài LCS thêm 1 so với hai tiền tố bỏ nó đi: dp[i][j] = dp[i − 1][j − 1] + 1; (b) Nếu khác nhau, ta bỏ ký tự cuối của X hoặc của Y để giữ phương án tốt hơn: dp[i][j] = max(dp[i − 1][j], dp[i][j − 1]).",
          "Bước 4 — Xử lý trường hợp rỗng: Độ dài LCS là len = dp[m][n]. Nếu len == 0, in 0 ở dòng 1 và \"EMPTY\" ở dòng 2 rồi dừng ngay.",
          "Bước 5 — Truy vết ngược (Traceback) theo đúng quy ước phá hòa: Xuất phát từ (i, j) = (m, n), pos = len và gán lcs[pos] = '\\0'. Chừng nào i > 0 && j > 0: nếu X[i − 1] == Y[j − 1] thì ghi ngược `lcs[--pos] = X[i - 1]` và lùi chéo `(i--, j--)`; ngược lại nếu `dp[i - 1][j] > dp[i][j - 1]` (dấu `>` NGHIÊM NGẶT!) thì đi lên `i--`, còn lại (kể cả khi bằng nhau) đi sang trái `j--`."
        ],
        "whyThisWay": "Chuỗi độ dài m có tới 2^m chuỗi con — duyệt vét cạn so sánh từng chuỗi con mất thời gian hàm mũ O(2^(m+n)). Bảng DP 2D gom toàn bộ bài toán con trùng lặp lại thành đúng m × n ô, tính xong chỉ trong O(m × n). Đặc biệt, bài toán thường có nhiều LCS cùng độ dài tối đa, nên bắt buộc phải giữ lại cả bảng 2D `dp[1005][1005]` (không nén xuống 1D được!) để truy vết, và phải dùng đúng dấu `>` nghiêm ngặt thay vì `>=` khi so sánh `dp[i-1][j]` với `dp[i][j-1]` để ra đúng chuỗi duy nhất mà bộ test yêu cầu.",
        "complexity": "Thời gian: O(m × n) để lập bảng + O(m + n) để truy vết (≤ 10^6 phép toán khi m, n ≤ 1000) · Bộ nhớ: O(m × n) (~4 MB trên vùng nhớ BSS cho dp[1005][1005])."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–6",
          "title": "Khai báo thư viện và các mảng tĩnh toàn cục",
          "code": "#include <stdio.h>\n#include <string.h>\n\nchar X[1005], Y[1005];\nint dp[1005][1005];\nchar lcs[1005];",
          "explain": "Cần `<string.h>` để dùng hàm `strlen()`. Mảng `dp[1005][1005]` chiếm khoảng 1005 × 1005 × 4 byte ≈ 4 MB. Đặt ở ngoài hàm `main()` (vùng nhớ toàn cục BSS) giải quyết 2 việc cùng lúc: (1) Tránh tràn Stack (Stack mặc định trên Windows/Linux thường chỉ 1–8 MB, khai báo mảng 4 MB cục bộ trong main rất dễ crash!); (2) Toàn bộ hàng 0 `dp[0][j]` và cột 0 `dp[i][0]` tự động được gán 0 sẵn. Hai mảng `X`, `Y` và `lcs` kích thước 1005 đủ chứa tối đa 1000 ký tự cộng ký tự kết thúc `'\\0'`."
        },
        {
          "lines": "Dòng 8–11",
          "title": "Đọc hai chuỗi X, Y và lấy độ dài m, n",
          "code": "int main() {\n    scanf(\"%s %s\", X, Y);\n    int m = strlen(X);\n    int n = strlen(Y);",
          "explain": "Vì đề cho hai chuỗi không chứa khoảng trắng, `scanf(\"%s %s\", X, Y)` tự động bỏ qua khoảng trắng/xuống dòng giữa hai dòng và đọc sạch hai chuỗi (chú ý tên mảng `X`, `Y` bản thân nó đã là địa chỉ phần tử đầu tiên nên KHÔNG thêm dấu `&`). Lưu sẵn `m = strlen(X)` và `n = strlen(Y)` ra biến để tránh gọi lặp `strlen()` trong vòng lặp (nếu gọi trong điều kiện for sẽ khiến độ phức tạp bị đẩy lên O(m×n×(m+n)))."
        },
        {
          "lines": "Dòng 13–23",
          "title": "Lập bảng Quy hoạch động 2D tính độ dài LCS",
          "code": "    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (X[i - 1] == Y[j - 1]) {\n                dp[i][j] = dp[i - 1][j - 1] + 1;\n            } else if (dp[i - 1][j] > dp[i][j - 1]) {\n                dp[i][j] = dp[i - 1][j];\n            } else {\n                dp[i][j] = dp[i][j - 1];\n            }\n        }\n    }",
          "explain": "LƯU Ý CHỈ SỐ: Chuỗi trong C đánh số từ 0 (`0..m-1`), còn bảng `dp` đánh số từ 1 (`1..m`), nên ký tự thứ `i` của X là `X[i - 1]` và ký tự thứ `j` của Y là `Y[j - 1]`. Nếu hai ký tự khớp nhau, cộng 1 từ ô chéo trên-trái `dp[i - 1][j - 1]`. Nếu không khớp, lấy giá trị lớn hơn giữa ô ngay trên `dp[i - 1][j]` (bỏ `X[i-1]`) và ô ngay trái `dp[i][j - 1]` (bỏ `Y[j-1]`)."
        },
        {
          "lines": "Dòng 25–31",
          "title": "In độ dài LCS và xử lý trường hợp đặc biệt len == 0",
          "code": "    int len = dp[m][n];\n    printf(\"%d\\n\", len);\n\n    if (len == 0) {\n        printf(\"EMPTY\\n\");\n        return 0;\n    }",
          "explain": "Ô góc dưới phải `dp[m][n]` lưu độ dài LCS của toàn bộ X và Y. Ta in ngay `len` trên dòng 1. Nếu `len == 0` (hai chuỗi hoàn toàn không có ký tự chung nào), đề yêu cầu dòng 2 phải in chính xác chuỗi `\"EMPTY\"` (viết hoa) rồi thoát luôn bằng `return 0;`."
        },
        {
          "lines": "Dòng 33–34",
          "title": "Khởi tạo con trỏ truy vết và ký tự kết thúc chuỗi lcs",
          "code": "    int i = m, j = n, pos = len;\n    lcs[pos] = '\\0';",
          "explain": "Vì ta truy vết NGƯỢC từ cuối chuỗi `(m, n)` về đầu chuỗi `(0, 0)`, các ký tự khớp tìm thấy sẽ xuất hiện theo thứ tự từ phải sang trái. Do đó ta đặt `pos = len`, gán sẵn ký tự kết thúc chuỗi `lcs[len] = '\\0'`, rồi mỗi lần tìm thấy ký tự khớp sẽ điền ngược vào `lcs[--pos]` (giảm pos trước rồi gán) — kết thúc vòng lặp ta thu ngay chuỗi theo đúng thứ tự xuôi mà không cần bước đảo chuỗi!"
        },
        {
          "lines": "Dòng 35–45",
          "title": "Vòng lặp truy vết ngược (Traceback) tuân thủ quy tắc phá hòa",
          "code": "    while (i > 0 && j > 0) {\n        if (X[i - 1] == Y[j - 1]) {\n            lcs[--pos] = X[i - 1];\n            i--;\n            j--;\n        } else if (dp[i - 1][j] > dp[i][j - 1]) {\n            i--;\n        } else {\n            j--;\n        }\n    }",
          "explain": "Vòng lặp chạy chừng nào cả hai chuỗi còn ký tự (`i > 0 && j > 0`). (1) Nếu `X[i - 1] == Y[j - 1]`, ký tự này thuộc LCS → ghi vào `lcs[--pos]` và lùi chéo `i--; j--;`. (2) Nếu khác nhau, kiểm tra ĐÚNG điều kiện đề bài: `dp[i - 1][j] > dp[i][j - 1]` (so sánh lớn hơn NGHIÊM NGẶT `>`!) thì đi lên `i--`; ngược lại (kể cả khi `dp[i - 1][j] == dp[i][j - 1]`) thì rẽ sang trái `j--`. Nếu bạn gõ nhầm `>=`, khi hòa sẽ rẽ lên thay vì rẽ trái và cho ra một LCS khác không khớp đáp án chấm tự động!"
        },
        {
          "lines": "Dòng 47–49",
          "title": "In chuỗi LCS đã tái tạo và kết thúc chương trình",
          "code": "    printf(\"%s\\n\", lcs);\n    return 0;\n}",
          "explain": "Khi vòng `while` kết thúc, `pos` chắc chắn giảm về đúng 0 và `lcs[0..len-1]` chứa trọn vẹn chuỗi LCS kèm `'\\0'` ở `lcs[len]`. Gọi `printf(\"%s\\n\", lcs)` in dòng 2 rồi `return 0;`."
        }
      ],
      "testCases": [
        {
          "name": "Kiểm tra quy tắc phá hòa (ví dụ đề bài)",
          "caseDesc": "X = \"ACDBE\", Y = \"ABCDE\" (có 2 LCS dài 4 là \"ACDE\" và \"ABDE\").",
          "howHandled": "Khi truy vết đến ô (3, 3) (X[2]='D', Y[2]='C'), dp[2][3]=2 == dp[3][2]=2; nhờ dấu `>` nghiêm ngặt, chương trình đi trái (j--) thay vì đi lên → giữ lại 'C' và in đúng \"4\\nACDE\"."
        },
        {
          "name": "Hai chuỗi hoàn toàn không có ký tự chung",
          "caseDesc": "X = \"ABC\", Y = \"XYZ\".",
          "howHandled": "Toàn bảng dp đều bằng 0 → len = 0 → nhánh `if (len == 0)` in \"0\\nEMPTY\" và thoát sạch."
        },
        {
          "name": "Hai chuỗi giống hệt nhau hoặc độ dài 1",
          "caseDesc": "X = \"A\", Y = \"A\" hoặc X = \"HELLO\", Y = \"HELLO\".",
          "howHandled": "Mọi bước truy vết đều đi theo đường chéo `i--, j--`, điền đủ từ `pos = len - 1` về `0` → in chính chuỗi đó."
        },
        {
          "name": "Biên kích thước tối đa |X| = |Y| = 1000",
          "caseDesc": "Hai chuỗi dài 1000 ký tự.",
          "howHandled": "Bảng `dp[1005][1005]` nằm trên BSS (~4 MB) không tràn Stack, 10^6 phép lặp chạy trong ~10 ms."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo toàn cục `char X[1005], Y[1005], lcs[1005];` và `int dp[1005][1005];` (tránh tràn Stack, mặc định = 0).",
        "Bước 2: Đọc `X`, `Y` bằng `scanf(\"%s %s\", X, Y);` và tính `m = strlen(X); n = strlen(Y);`.",
        "Bước 3: Lập bảng DP `i = 1..m`, `j = 1..n`: nếu `X[i-1] == Y[j-1]` thì `dp[i-1][j-1] + 1`, ngược lại `max(dp[i-1][j], dp[i][j-1])`.",
        "Bước 4: In `len = dp[m][n]`; nếu `len == 0` thì in `\"EMPTY\\n\"` và `return 0;`.",
        "Bước 5: Truy vết từ `i = m, j = n, pos = len`, đặt `lcs[pos] = '\\0'`: khớp thì `lcs[--pos] = X[i-1]; i--; j--;`, ngược lại `if (dp[i-1][j] > dp[i][j-1]) i--; else j--;` (nhớ dấu `>` nghiêm ngặt!). Cuối cùng in `lcs`."
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
      "CR-38"
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
      "origin": "Chương 7 — Bài toán Cắt thanh gỗ mở rộng (Extended Bottom-Up Cut-Rod kèm mảng truy vết s[] · Mục 7.9 · Slide APT07 trang 17–18).",
      "idea": {
        "summary": "Mở rộng từ bài Cắt thanh gỗ (CR-34): ngoài việc tính doanh thu lớn nhất `r[n]`, ta phải in ra chính xác danh sách độ dài các đoạn gỗ cần cắt. Để làm được điều đó mà không tốn thêm độ phức tạp, ngay lúc tìm thấy nhát cắt đầu tiên `i` giúp thanh dài `j` đạt doanh thu cao hơn kỷ lục cũ `q`, ta ghi nhớ ngay lựa chọn đó vào mảng phụ `s[j] = i`. Sau cùng chỉ việc lần theo `s[n]`, rồi trừ đi độ dài vừa cắt `cur -= s[cur]` cho tới khi hết thanh gỗ.",
        "steps": [
          "Bước 1 — Định nghĩa hai mảng trạng thái DP: Gọi `r[j]` (long long) là doanh thu tối đa của thanh gỗ dài j; gọi `s[j]` (int) là độ dài đoạn cắt đầu tiên tối ưu cho thanh gỗ dài j (1 ≤ j ≤ n).",
          "Bước 2 — Điều kiện cơ sở (Base Case): `r[0] = 0`. Với mỗi chiều dài `j` từ 1 đến n, khởi tạo biến tạm kỷ lục `q = -1` (nhỏ hơn mọi giá bán p[i] ≥ 0 để ngay ở lượt `i = 1`, `s[j]` chắc chắn được gán ít nhất 1 lần).",
          "Bước 3 — Chuyển trạng thái & Quy ước phá hòa nghiêm ngặt `>`: Duyệt `i` tăng dần từ 1 đến j, xét tổng `p[i] + r[j - i]`. CHỈ cập nhật `q = p[i] + r[j - i]` và `s[j] = i` khi `p[i] + r[j - i] > q` (dấu `>` nghiêm ngặt!). Nhờ duyệt `i` từ nhỏ đến lớn và dùng `>`, nếu nhiều cách cắt hòa doanh thu, đoạn cắt đầu tiên nhỏ nhất luôn được giữ lại.",
          "Bước 4 — Lưu ý tránh lỗi kinh điển trên Slide 18: Phải gán `s[j] = i` (lưu cho thanh dài `j`), tuyệt đối không gõ nhầm `s[i] = i`; và phải dùng `p[i] + r[j - i]` (bán thẳng đoạn dài i) chứ không dùng `r[i] + r[j - i]`.",
          "Bước 5 — Truy vết chuỗi đoạn cắt bằng vòng `while`: Đặt `cur = n`. Khi `cur > 0`, in `s[cur]` (dùng cờ `first` để không dư dấu cách cuối dòng), sau đó giảm phần gỗ còn lại `cur -= s[cur]`."
        ],
        "whyThisWay": "Nếu chỉ tính mảng `r[]` mà không lưu bảng lựa chọn `s[]`, ta không biết thanh gỗ nên cắt ở đâu. Lưu mảng `s[j]` chỉ tốn thêm đúng O(n) bộ nhớ (~8 KB) và 1 câu lệnh gán O(1), giúp bước truy vết cuối cùng chạy siêu nhanh trong O(n). Hơn nữa, dùng `p[i] + r[j - i]` bảo đảm `s[j]` luôn là một đoạn gỗ nguyên vẹn bán trực tiếp (không cần cắt tiếp), nên vòng lặp truy vết chỉ cần nhảy 1 chiều `cur -= s[cur]` thay vì phải đệ quy chia đôi phức tạp.",
        "complexity": "Thời gian: O(n^2) để lập bảng r[] và s[] + O(n) để truy vết · Bộ nhớ: O(n) (ba mảng toàn cục p, r, s kích thước 2005)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện và ba mảng toàn cục p, r, s",
          "code": "#include <stdio.h>\n\nlong long p[2005], r[2005];\nint s[2005];",
          "explain": "Mảng `p[2005]` lưu bảng giá, `r[2005]` lưu doanh thu tối ưu (đều dùng `long long` để tránh tràn khi tổng tiền lên tới 2×10^9). Mảng `s[2005]` lưu độ dài đoạn cắt đầu tiên tối ưu (chỉ nằm trong [1..2000] nên dùng `int` là đủ). Khai báo toàn cục kích thước 2005 cho phép đánh chỉ số 1-based an toàn với n ≤ 2000."
        },
        {
          "lines": "Dòng 6–9",
          "title": "Đọc chiều dài n và bảng giá p[1..n]",
          "code": "int main() {\n    int n;\n    scanf(\"%d\", &n);\n    for (int i = 1; i <= n; i++) scanf(\"%lld\", &p[i]);",
          "explain": "Đọc chiều dài thanh gỗ `n` và nhập `n` mức giá vào `p[1..n]` bằng đặc tả `\"%lld\"` tương ứng với kiểu `long long`."
        },
        {
          "lines": "Dòng 11–13",
          "title": "Khởi tạo cơ sở r[0] = 0 và đặt kỷ lục tạm q = -1",
          "code": "    r[0] = 0;\n    for (int j = 1; j <= n; j++) {\n        long long q = -1;",
          "explain": "Cơ sở `r[0] = 0`. RẤT TINH TẾ Ở DÒNG 13: Tại sao đặt `q = -1` mà không đặt `q = 0` như bài CR-34? Bởi vì nếu gặp test có tất cả giá bán `p[i] = 0`, khi `q = 0` thì điều kiện `0 + 0 > 0` sẽ luôn SAI, khiến `s[j]` không bao giờ được gán (giữ nguyên giá trị 0) và vòng lặp `while (cur > 0) cur -= s[cur]` phía sau sẽ LẶP VÔ HẠN (TLE)! Đặt `q = -1` đảm bảo ngay ở `i = 1`, `p[1] + r[j - 1] >= 0 > -1` luôn ĐÚNG nên `s[j]` luôn ≥ 1!"
        },
        {
          "lines": "Dòng 14–21",
          "title": "Thử các đoạn cắt i = 1..j, cập nhật nghiêm ngặt > và ghi vết s[j] = i",
          "code": "        for (int i = 1; i <= j; i++) {\n            if (p[i] + r[j - i] > q) {\n                q = p[i] + r[j - i];\n                s[j] = i;\n            }\n        }\n        r[j] = q;\n    }",
          "explain": "Vòng trong duyệt độ dài đoạn cắt đầu tiên `i` từ 1 tăng dần đến `j`. Hai chi tiết sống còn: (1) So sánh NGHIÊM NGẶT `>` — khi có hai cách cắt cùng doanh thu (ví dụ n = 7: cắt 1+6 hay 2+2+3 đều được 18), lượt `i = 1` xuất hiện trước nên được ghi `s[7] = 1`, đến lượt `i = 2` vì `18 > 18` là sai nên không ghi đè, đảm bảo đúng quy ước ưu tiên đoạn đầu nhỏ nhất; (2) Ghi chính xác `s[j] = i` (chỉ số của `s` là `j`, KHÔNG phải `s[i] = i` như lỗi đánh máy kinh điển trên slide cũ!). Cuối vòng trong lưu `r[j] = q`."
        },
        {
          "lines": "Dòng 23",
          "title": "In tổng doanh thu tối đa r[n] trên dòng 1",
          "code": "    printf(\"%lld\\n\", r[n]);",
          "explain": "In giá trị doanh thu tối ưu `r[n]` bằng `\"%lld\\n\"` kết thúc dòng thứ nhất của output."
        },
        {
          "lines": "Dòng 25–35",
          "title": "Truy vết in dãy các đoạn cắt không dư dấu cách cuối dòng",
          "code": "    int cur = n;\n    int first = 1;\n    while (cur > 0) {\n        if (!first) printf(\" \");\n        printf(\"%d\", s[cur]);\n        first = 0;\n        cur -= s[cur];\n    }\n    printf(\"\\n\");\n    return 0;\n}",
          "explain": "Bắt đầu từ toàn bộ thanh gỗ `cur = n`. Dùng biến cờ `first = 1` để kiểm soát dấu cách: phần tử đầu tiên không in dấu cách phía trước, các phần tử tiếp theo (`!first`) in một dấu cách `\" \"` trước khi in `s[cur]`, đảm bảo tuyệt đối không thừa khoảng trắng cuối dòng. Sau khi in đoạn cắt `s[cur]`, phần gỗ còn lại là `cur -= s[cur]`. Vì mọi `s[cur] >= 1`, `cur` giảm chặt về đúng 0 và vòng `while` kết thúc sau tối đa n bước. Cuối cùng xuống dòng `\\n` và `return 0;`."
        }
      ],
      "testCases": [
        {
          "name": "Nhiều cách cắt hòa doanh thu (ví dụ đề bài)",
          "caseDesc": "n = 7, p = [1, 5, 8, 9, 10, 17, 17] (1+6 = 18 và 2+2+3 = 18).",
          "howHandled": "Do dấu `>` nghiêm ngặt, tại j = 7 giá trị i = 1 đạt 1 + r[6] = 18 đầu tiên nên s[7] = 1; kế tiếp cur = 6 có s[6] = 6 → in \"18\\n1 6\"."
        },
        {
          "name": "Để nguyên thanh gỗ là tối ưu nhất",
          "caseDesc": "n = 3, p = [1, 2, 100].",
          "howHandled": "Tại j = 3, i = 3 đạt p[3] + r[0] = 100 lớn nhất → s[3] = 3. Truy vết: in 3, cur = 3 - 3 = 0 dừng → in \"100\\n3\"."
        },
        {
          "name": "Trường hợp biên mọi giá p[i] = 0 (kiểm chứng q = -1)",
          "caseDesc": "n = 3, p = [0, 0, 0].",
          "howHandled": "Nhờ khởi tạo `q = -1`, tại mỗi j lượt i = 1 luôn thỏa `0 > -1` → s[j] = 1 → truy vết cắt thành \"1 1 1\" không bị lặp vô hạn."
        },
        {
          "name": "Cắt nhỏ thành nhiều đoạn giống nhau",
          "caseDesc": "n = 4, p = [5, 8, 9, 10] (đoạn dài 1 lời nhất).",
          "howHandled": "r[4] = 20, s[4] = s[3] = s[2] = s[1] = 1 → in \"20\\n1 1 1 1\" không dư khoảng trắng cuối."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo toàn cục `long long p[2005], r[2005];` và `int s[2005];`.",
        "Bước 2: Đọc `n` và nhập bảng giá `p[1..n]` theo chỉ số 1-based.",
        "Bước 3: Đặt `r[0] = 0;`. Lặp `j = 1..n`: khởi tạo `long long q = -1;` (NHỚ `-1` để không lỗi khi `p[i] = 0`!), lặp `i = 1..j`: nếu `p[i] + r[j - i] > q` (dấu `>` nghiêm ngặt!) thì `q = p[i] + r[j - i]; s[j] = i;` (NHỚ `s[j] = i`, không phải `s[i] = i`!). Gán `r[j] = q;`.",
        "Bước 4: In dòng 1: `printf(\"%lld\\n\", r[n]);`.",
        "Bước 5: Truy vết dòng 2 bằng `cur = n, first = 1; while (cur > 0)` in dấu cách khi `!first`, in `s[cur]`, gán `first = 0; cur -= s[cur];`, cuối cùng in `\\n`."
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
      "origin": "Chương 7 — Lập lịch công việc có trọng số không chồng lấn (Weighted Interval Scheduling · DP + qsort + Binary Search O(n log n) · Mục 7.4 & 7.12).",
      "idea": {
        "summary": "Một CPU tại một thời điểm chỉ chạy được 1 tiến trình. Có n tiến trình, mỗi tiến trình có khoảng thời gian [s_i, f_i] và lợi nhuận p_i; hai tiến trình không chồng lấn nếu một tiến trình kết thúc trước hoặc đúng lúc tiến trình kia bắt đầu (f_i ≤ s_j). Ta sắp xếp toàn bộ tiến trình tăng dần theo thời điểm kết thúc f_i, rồi dùng Quy hoạch động quyết định tại từng tiến trình thứ i: hoặc BỎ QUA nó (giữ lợi nhuận của i − 1 tiến trình trước), hoặc CHỌN nó cộng thêm lợi nhuận tốt nhất của các tiến trình kết thúc ≤ s_i (tìm nhanh bằng Tìm kiếm nhị phân).",
        "steps": [
          "Bước 1 — Tiền xử lý bằng sắp xếp: Đọc n tiến trình vào mảng 1-based `jobs[1..n]` và dùng `qsort` sắp xếp tăng dần theo thời điểm kết thúc `f`. Sau khi sắp xếp, dãy `jobs[1].f ≤ jobs[2].f ≤ ... ≤ jobs[n].f` có tính đơn điệu tăng, tạo điều kiện cho cả DP lẫn Tìm kiếm nhị phân.",
          "Bước 2 — Tìm tiến trình tương thích gần nhất bằng Binary Search: Với tiến trình `i`, viết hàm `find_prev(i)` tìm chỉ số lớn nhất `prev` trong `[1..i − 1]` sao cho `jobs[prev].f <= jobs[i].s` (không chồng lấn với `i`). Nếu không có tiến trình nào kết thúc kịp trước `jobs[i].s`, trả về 0.",
          "Bước 3 — Định nghĩa trạng thái DP & Cơ sở: Gọi `dp[i]` (kiểu `long long`) là tổng lợi nhuận lớn nhất có thể đạt được khi chỉ xét `i` tiến trình đầu tiên `jobs[1..i]`. Điều kiện cơ sở: `dp[0] = 0` (0 tiến trình cho 0 lợi nhuận).",
          "Bước 4 — Công thức chuyển trạng thái (Recurrence): Với từng `i` từ 1 đến n, có đúng 2 lựa chọn loại trừ nhau: (a) Bỏ qua tiến trình i → `skip = dp[i − 1]`; (b) Chọn tiến trình i → mọi tiến trình chồng lấn đều bị loại, chỉ còn các tiến trình từ `1..prev` tương thích nên `take = jobs[i].p + dp[prev]`. Vậy `dp[i] = max(skip, take)`.",
          "Bước 5 — Trả kết quả: Sau khi tính đủ `i = 1..n`, giá trị `dp[n]` chính là tổng lợi nhuận tối đa có thể đạt được."
        ],
        "whyThisWay": "Thuật toán Tham lam theo thời điểm kết thúc sớm nhất (Earliest Finish Time) chỉ tối ưu khi mọi công việc đều có trọng số bằng 1 (bài toán đếm số lượng công việc tối đa), còn khi có lợi nhuận `p_i` khác nhau sẽ sai ngay (ví dụ 1 công việc ngắn lợi nhuận 1 chắn mất công việc dài lợi nhuận 100); tham lam theo lợi nhuận cao nhất cũng sai (ví dụ chọn (0, 6, 8) bỏ lỡ cặp (1, 4, 5) + (4, 7, 4) = 9). Còn nếu không dùng Tìm kiếm nhị phân mà quét tuyến tính ngược tìm `prev`, thời gian xấu nhất là O(n^2) (~10^8 phép tính khi n = 10^4), chậm hơn hàng trăm lần so với kết hợp `qsort + Binary Search` đạt chuẩn O(n log n).",
        "complexity": "Thời gian: O(n log n) (qsort tốn O(n log n) + n lần gọi find_prev mỗi lần O(log n)) · Bộ nhớ: O(n) (~320 KB cho mảng jobs[10005] và dp[10005])."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–9",
          "title": "Khai báo thư viện, cấu trúc Job và mảng toàn cục",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    long long s, f, p;\n} Job;\n\nJob jobs[10005];\nlong long dp[10005];",
          "explain": "Cần `<stdlib.h>` để dùng hàm sắp xếp `qsort()`. Kiểu cấu trúc `Job` gói gọn 3 thuộc tính: thời điểm bắt đầu `s`, kết thúc `f` và lợi nhuận `p`. Dùng `long long` cho cả 3 trường (dù `s, f ≤ 10^9` vừa `int`) giúp đồng nhất kiểu và tránh mọi rủi ro tràn số khi tính toán tổng lợi nhuận (n ≤ 10^4, p_i ≤ 10^6 → tổng đạt tới 10^10 > INT_MAX). Hai mảng toàn cục `jobs[10005]` và `dp[10005]` hỗ trợ đánh chỉ số 1-based."
        },
        {
          "lines": "Dòng 11–17",
          "title": "Hàm so sánh cmp_job cho qsort (an toàn tuyệt đối chống tràn)",
          "code": "int cmp_job(const void *a, const void *b) {\n    const Job *x = (const Job *)a;\n    const Job *y = (const Job *)b;\n    if (x->f < y->f) return -1;\n    if (x->f > y->f) return 1;\n    return 0;\n}",
          "explain": "Hàm so sánh chuẩn của `qsort` nhận hai con trỏ tổng quát `const void *a, *b` và phải trả về số âm nếu `a` đứng trước `b`, số dương nếu `a` đứng sau `b`, hoặc 0 nếu bằng nhau. Ta ép kiểu về `const Job *` rồi dùng toán tử mũi tên `->` truy cập trường `f`. CỰC KỲ QUAN TRỌNG: Phải so sánh bằng `<` và `>` rồi trả về `-1 / 1 / 0`, TUYỆT ĐỐI không viết `return x->f - y->f;` vì phép trừ hai số `long long` khi ép về `int` sẽ gây tràn số (Integer Overflow) làm `qsort` sắp xếp sai hoàn toàn!"
        },
        {
          "lines": "Dòng 19–31",
          "title": "Hàm find_prev(idx) — Tìm kiếm nhị phân O(log n) tìm tiến trình trước tương thích",
          "code": "int find_prev(int idx) {\n    int lo = 1, hi = idx - 1, ans = 0;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (jobs[mid].f <= jobs[idx].s) {\n            ans = mid;\n            lo = mid + 1;\n        } else {\n            hi = mid - 1;\n        }\n    }\n    return ans;\n}",
          "explain": "Ta cần tìm chỉ số LỚN NHẤT `mid` trong đoạn `[1..idx - 1]` thỏa mãn `jobs[mid].f <= jobs[idx].s` (chú ý dấu `<=` vì đề quy định chạm mốc `f_i == s_j` là KHÔNG chồng lấn!). Khởi tạo `ans = 0` làm giá trị mặc định nếu không có tiến trình nào phù hợp (khi đó `dp[0] = 0` khớp hoàn hảo!). Nếu `jobs[mid]` thỏa mãn, ta lưu tạm `ans = mid` rồi đẩy `lo = mid + 1` sang phải để thử tìm chỉ số lớn hơn nữa; ngược lại nếu chồng lấn thì thu hẹp sang trái `hi = mid - 1`. Với `n ≤ 10^4`, mỗi lần gọi chỉ mất tối đa 14 bước chia đôi!"
        },
        {
          "lines": "Dòng 33–38",
          "title": "Đọc số tiến trình n và dữ liệu từng tiến trình",
          "code": "int main() {\n    int n;\n    scanf(\"%d\", &n);\n    for (int i = 1; i <= n; i++) {\n        scanf(\"%lld %lld %lld\", &jobs[i].s, &jobs[i].f, &jobs[i].p);\n    }",
          "explain": "Đọc `n` tiến trình vào vị trí `jobs[1]` đến `jobs[n]` (chừa trống `jobs[0]` làm mốc rỗng khớp với `dp[0] = 0`). Đọc cả 3 trường `s, f, p` bằng đặc tả `\"%lld\"`."
        },
        {
          "lines": "Dòng 40",
          "title": "Sắp xếp đoạn jobs[1..n] tăng dần theo thời điểm kết thúc f",
          "code": "    qsort(jobs + 1, n, sizeof(Job), cmp_job);",
          "explain": "CHÚ Ý CON TRỎ BẮT ĐẦU `jobs + 1`! Vì dữ liệu nằm từ chỉ số `1` đến `n` (không phải từ `0`), ta bắt buộc truyền địa chỉ phần tử đầu tiên là `jobs + 1` (tương đương `&jobs[1]`), số phần tử là `n`, kích thước mỗi phần tử là `sizeof(Job)`, và con trỏ hàm `cmp_job`. Nếu viết nhầm `qsort(jobs, n, ...)` thì phần tử rác `jobs[0]` bị trộn vào sắp xếp còn `jobs[n]` bị bỏ sót!"
        },
        {
          "lines": "Dòng 42–48",
          "title": "Vòng lặp DP cân nhắc hai phương án CHỌN (take) và BỎ QUA (skip)",
          "code": "    dp[0] = 0;\n    for (int i = 1; i <= n; i++) {\n        int prev = find_prev(i);\n        long long take = jobs[i].p + dp[prev];\n        long long skip = dp[i - 1];\n        dp[i] = (take > skip) ? take : skip;\n    }",
          "explain": "Cơ sở `dp[0] = 0`. Với từng tiến trình `i` từ 1 đến n: gọi `prev = find_prev(i)` để tìm tiến trình gần nhất kết thúc ≤ `jobs[i].s`. Phương án CHỌN (`take`) thu được `jobs[i].p + dp[prev]` (nếu không có tiến trình trước nào tương thích thì `prev = 0` và `dp[0] = 0`, tức chỉ lấy mình `jobs[i].p`). Phương án BỎ QUA (`skip`) giữ nguyên lợi nhuận tối ưu của `i - 1` tiến trình đầu là `dp[i - 1]`. Gán `dp[i]` bằng giá trị lớn hơn giữa `take` và `skip`."
        },
        {
          "lines": "Dòng 50–52",
          "title": "In tổng lợi nhuận tối đa và kết thúc chương trình",
          "code": "    printf(\"%lld\\n\", dp[n]);\n    return 0;\n}",
          "explain": "Do `dp[i]` là tổng lợi nhuận lớn nhất trên `i` tiến trình đầu, đáp án tối ưu toàn cục nằm tại `dp[n]`. In bằng `\"%lld\\n\"` và trả về 0."
        }
      ],
      "testCases": [
        {
          "name": "5 tiến trình chồng lấn có bẫy Tham lam (ví dụ đề bài)",
          "caseDesc": "Jobs: (1,4,5), (3,5,1), (0,6,8), (4,7,4), (3,8,6).",
          "howHandled": "Đã xếp theo f tăng dần: dp[1]=5, dp[2]=5, dp[3]=8, dp[4]=max(8, 4+dp[1])=9 (chạm mốc f_1=4 == s_4=4!), dp[5]=max(9, 6+dp[0])=9 → in 9."
        },
        {
          "name": "Kiểm chứng chạm mốc biên f_i == s_j",
          "caseDesc": "n = 2: (0, 5, 10) và (5, 10, 20).",
          "howHandled": "Điều kiện `jobs[mid].f <= jobs[idx].s` nhận diện 5 <= 5 là không chồng lấn → `find_prev(2) = 1` → chọn cả 2, in 30."
        },
        {
          "name": "Tất cả tiến trình đều chồng lấn nhau hoặc n = 1",
          "caseDesc": "n = 3: (0, 10, 5), (2, 8, 12), (4, 9, 7).",
          "howHandled": "Mọi `find_prev(i)` đều trả về 0 (`dp[0] = 0`), thuật toán tự chọn tiến trình đơn lẻ có lợi nhuận cao nhất là 12."
        },
        {
          "name": "Mốc thời gian lớn f_i = 10^9 và tổng lợi nhuận vượt 32-bit",
          "caseDesc": "n = 10^4 tiến trình nối tiếp nhau, mỗi tiến trình p_i = 10^6, f_i lên tới 10^9.",
          "howHandled": "Hàm `cmp_job` so sánh `< / >` không tràn khi sắp xếp; `dp[]` dùng `long long` chứa chính xác tổng 10^10; thời gian O(n log n) chạy < 10 ms."
        }
      ],
      "examRecipe": [
        "Bước 1: Định nghĩa `typedef struct { long long s, f, p; } Job;`, khai báo toàn cục `Job jobs[10005]; long long dp[10005];`.",
        "Bước 2: Viết `cmp_job` so sánh `x->f` với `y->f` bằng `<` và `>` trả về `-1 / 1 / 0` (tránh phép trừ bị tràn).",
        "Bước 3: Viết `find_prev(idx)` chặt nhị phân trên `[1..idx-1]` tìm `mid` lớn nhất thỏa `jobs[mid].f <= jobs[idx].s` (mặc định trả về `0`).",
        "Bước 4: Đọc `n` và `jobs[1..n]`, rồi gọi `qsort(jobs + 1, n, sizeof(Job), cmp_job);` (NHỚ `jobs + 1` cho 1-based!).",
        "Bước 5: Gán `dp[0] = 0;`, lặp `i = 1..n`: `dp[i] = max(dp[i - 1], jobs[i].p + dp[find_prev(i)])`. Cuối cùng in `dp[n]`."
      ]
    }
  }
];
