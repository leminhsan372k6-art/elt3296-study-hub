export const PART4_PARALLEL_QUESTIONS = [
  {
    "num": 25,
    "id": "CR-25",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Dễ",
    "title": "Đếm song song các số lẻ chia hết cho d bằng kỹ thuật Local Counter",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join; tránh mutex trong vòng đếm",
    "prompt": "Cho đoạn số nguyên [L, R], số nguyên dương lẻ d và số luồng T. Áp dụng mô hình thiết kế song song Foster (phân hoạch đoạn [L, R] cho T luồng) để đếm có bao nhiêu số nguyên x trong [L, R] vừa là số lẻ vừa chia hết cho d. Mỗi luồng phải sử dụng biến đếm cục bộ (local counter) trong suốt vòng lặp và chỉ ghi một lần vào mảng kết quả counts[tid] khi kết thúc, không khóa mutex ở từng bước kiểm tra. Sau pthread_join(), luồng chính cộng dồn và in kết quả.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create() và pthread_join(), mỗi luồng đếm trên phân đoạn riêng bằng biến cục bộ.",
      "Không khóa/mở mutex bên trong vòng lặp đếm từng số (tránh nghẽn cổ chai đồng bộ như psum_mutex).",
      "Sử dụng kiểu long long để tránh tràn số khi R lớn."
    ],
    "inputSpec": "Một dòng chứa 4 số nguyên: L R d T.",
    "outputSpec": "Một số nguyên (long long) là số lượng số lẻ trong [L, R] chia hết cho d.",
    "constraints": [
      "1 <= L <= R <= 10^7",
      "1 <= d <= 1000 (d lẻ)",
      "1 <= T <= 16"
    ],
    "example": {
      "note": "Trong [1, 20], các số lẻ chia hết cho 3 là 3, 9, 15 -> có 3 số.",
      "input": "1 20 3 4",
      "output": "3"
    },
    "relatedTopics": [
      {
        "id": "5-4",
        "label": "5.4 Phương pháp Thiết kế Song song 4 Bước của Foster"
      },
      {
        "id": "5-7",
        "label": "5.7 Tối ưu psum_local: Tích lũy trên Thanh ghi, 0 Khóa Mutex"
      },
      {
        "id": "6-3",
        "label": "6.3 Phòng tránh False Sharing khi ghi liên tục vào mảng chung"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Nếu đặt pthread_mutex_lock quanh từng bước lặp (như psum_mutex), chương trình chậm gấp hàng trăm lần tuần tự; ngay cả nếu cộng trực tiếp counts[tid]++ ở mỗi vòng cũng bị False Sharing trên dòng cache 64-byte! Tích lũy trên biến cục bộ local_cnt rồi gán 1 lần duy nhất là chuẩn mực vàng.",
    "relatedQuestions": [
      "CR-26",
      "CR-27",
      "CR-28"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nlong long L, R, d;\nint T;\nlong long counts[20];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    long long total = R - L + 1;\n    long long base = total / T;\n    long long rem = total % T;\n\n    long long start = L + tid * base + (tid < rem ? tid : rem);\n    long long len = base + (tid < rem ? 1 : 0);\n    long long end = start + len - 1;\n\n    long long local_cnt = 0;\n    for (long long x = start; x <= end; x++) {\n        if (x % 2 != 0 && x % d == 0) {\n            local_cnt++;\n        }\n    }\n    counts[tid] = local_cnt;\n    return NULL;\n}\n\nint main() {\n    scanf(\"%lld %lld %lld %d\", &L, &R, &d, &T);\n\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    long long ans = 0;\n    for (int i = 0; i < T; i++) ans += counts[i];\n    printf(\"%lld\\n\", ans);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Nhảy bước x += d bắt đầu từ bội số đầu tiên của d trong đoạn [s, e] vừa giữ đúng phân hoạch tĩnh vừa giảm số bước lặp đi d lần.",
      "Biến local_cnt nằm hoàn toàn trên thanh ghi CPU suốt vòng lặp, chỉ ghi 1 lần duy nhất ra counts[t->tid] khi kết thúc."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "pthread_mutex_lock"
      ],
      "qualityRules": [
        {
          "desc": "Sử dụng kiểu long long cho khoảng [L, R] tới 10^7",
          "regex": "long\\s+long",
          "flags": ""
        },
        {
          "desc": "Gán kết quả biến cục bộ ra mảng counts[] 1 lần ngoài vòng lặp",
          "regex": "\\[\\s*[^\\]]+\\]\\s*=\\s*\\w+\\s*;",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng pthread_mutex_lock trong vòng lặp đếm vi phạm yêu cầu tối ưu Local Counter!",
          "regex": "pthread_mutex_lock",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 5 — Mô hình thiết kế song song 4 bước của Foster & kỹ thuật Local Counter (`psum_local`) loại bỏ nghẽn mutex và False Sharing (Mục 5.4, 5.7, 6.3 · Lab 5 Bài 1).",
      "idea": {
        "summary": "Bài toán yêu cầu đếm số lượng số nguyên x thuộc đoạn [L, R] vừa lẻ (x % 2 != 0) vừa chia hết cho d (x % d == 0) bằng T luồng POSIX. Thay vì để T luồng tranh giành một biến đếm chung có khóa mutex, ta chia đều đoạn [L, R] thành T đoạn rời nhau, mỗi luồng tự đếm trên biến cục bộ (nằm trong thanh ghi CPU) rồi mới ghi kết quả một lần duy nhất vào ô counts[tid] của riêng mình.",
        "steps": [
          "Bước 1 — Đọc đầu vào: Luồng chính (main) đọc L, R, d (kiểu long long) và số luồng T (kiểu int) vào biến toàn cục để mọi luồng đều đọc được.",
          "Bước 2 — Phân hoạch tĩnh Foster: Với tổng số phần tử total = R - L + 1, tính thương base = total / T và phần dư rem = total % T; các luồng đầu tiên (tid < rem) nhận (base + 1) số, các luồng còn lại nhận base số.",
          "Bước 3 — Xác định đoạn [start, end] riêng cho từng luồng: Tính chính xác start = L + tid * base + min(tid, rem), len = base + (tid < rem ? 1 : 0) và end = start + len - 1 để đảm bảo không sót và không trùng số nào.",
          "Bước 4 — Đếm cục bộ không khóa (Local Counter): Trong vòng lặp x chạy từ start đến end, tăng biến cục bộ local_cnt trên thanh ghi CPU mỗi khi gặp số lẻ chia hết cho d; kết thúc vòng lặp mới ghi 1 lần counts[tid] = local_cnt.",
          "Bước 5 — Đồng bộ & Gộp kết quả (Reduce): Luồng chính gọi pthread_join() chờ đủ T luồng hoàn tất, sau đó cộng dồn counts[0..T-1] vào biến ans và in ra màn hình."
        ],
        "whyThisWay": "Nếu khóa pthread_mutex_lock ở từng số (kiểu psum_mutex), hàng triệu thao tác khóa/mở sẽ biến chương trình song song thành tuần tự chậm gấp hàng trăm lần. Ngay cả khi bỏ mutex và tăng trực tiếp counts[tid]++ trong vòng lặp, nhiều luồng vẫn gặp lỗi False Sharing vì các phần tử counts[0..7] nằm chung một dòng cache 64 byte; dùng biến cục bộ local_cnt rồi ghi 1 lần duy nhất triệt tiêu đồng thời cả nghẽn mutex lẫn False Sharing.",
        "complexity": "Thời gian: O((R - L + 1) / T + T) · Bộ nhớ: O(T) (mảng counts[20] cố định) · Tài nguyên: T luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–6",
          "title": "Khai báo thư viện & biến chia sẻ toàn cục",
          "code": "#include <stdio.h>\n#include <pthread.h>\nlong long L, R, d;\nint T;\nlong long counts[20];",
          "explain": "Thư viện <stdio.h> cung cấp scanf/printf, còn <pthread.h> cung cấp kiểu pthread_t và các hàm tạo/chờ luồng (khi biên dịch phải thêm cờ -pthread). Các biến L, R, d dùng kiểu long long (64-bit, chứa tới ~9×10^18) để an toàn khi R tới 10^7 hoặc lớn hơn. Mảng counts[20] đủ rộng cho T <= 16; mỗi luồng chỉ ghi vào duy nhất ô counts[tid] của mình nên không xảy ra tranh chấp dữ liệu (data race)."
        },
        {
          "lines": "Dòng 8–16",
          "title": "Hàm luồng worker() & công thức phân hoạch tĩnh Foster",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    long long total = R - L + 1;\n    long long base = total / T;\n    long long rem = total % T;\n    long long start = L + tid * base + (tid < rem ? tid : rem);\n    long long len = base + (tid < rem ? 1 : 0);\n    long long end = start + len - 1;",
          "explain": "Mọi hàm luồng POSIX bắt buộc có chữ ký void *ten_ham(void *arg). Dòng int tid = *(int *)arg ép kiểu con trỏ tổng quát void* về int* rồi giải tham chiếu (*) để lấy chỉ số luồng 0..T-1. Tổng số phần tử là total = R - L + 1 (ví dụ [1, 10] có 10 số). Ta chia phần dư rem cho rem luồng đầu tiên: luồng tid đứng sau đúng min(tid, rem) luồng được cộng thêm 1 phần tử, nên vị trí bắt đầu là L + tid * base + (tid < rem ? tid : rem) và độ dài là len = base + (tid < rem ? 1 : 0). Nếu T > total (ví dụ total = 2, T = 4), các luồng dư có len = 0 → end = start - 1, hoàn toàn không gây lỗi."
        },
        {
          "lines": "Dòng 18–26",
          "title": "Vòng lặp đếm cục bộ (Local Counter) & ghi 1 lần duy nhất",
          "code": "    long long local_cnt = 0;\n    for (long long x = start; x <= end; x++) {\n        if (x % 2 != 0 && x % d == 0) {\n            local_cnt++;\n        }\n    }\n    counts[tid] = local_cnt;\n    return NULL;\n}",
          "explain": "Biến local_cnt khai báo trong hàm nên nằm trên ngăn xếp riêng (stack) và thường được trình biên dịch đặt thẳng vào thanh ghi CPU (register), hoàn toàn cách ly với các luồng khác. Vòng lặp kiểm tra x <= end (nếu len == 0 thì end < start nên vòng lặp tự động chạy 0 lần). Điều kiện x % 2 != 0 kiểm tra số lẻ (an toàn hơn x % 2 == 1 khi mở rộng sang số âm) kết hợp x % d == 0. Chỉ sau khi kết thúc toàn bộ vòng lặp, luồng mới ghi 1 lần duy nhất counts[tid] = local_cnt để tránh False Sharing trên L1 cache, rồi trả về NULL đúng chuẩn kiểu void*."
        },
        {
          "lines": "Dòng 28–37",
          "title": "Đọc dữ liệu, sinh T luồng an toàn & đồng bộ bằng pthread_join()",
          "code": "int main() {\n    scanf(\"%lld %lld %lld %d\", &L, &R, &d, &T);\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);",
          "explain": "Dùng đặc tả %lld cho L, R, d (long long) và %d cho T (int). BẪY KINH ĐIỂN CỦA NGƯỜI MỚI: tuyệt đối không truyền &i vào pthread_create() vì biến vòng lặp i bị thay đổi liên tục trước khi luồng kịp đọc, khiến nhiều luồng nhận trùng tid hoặc tid == T! Thay vào đó phải lưu vào mảng riêng ids[i] = i rồi truyền &ids[i]. Ngoài ra, vòng pthread_join() PHẢI tách thành vòng for riêng sau vòng pthread_create(); nếu gộp chung vào 1 vòng thì luồng 0 xong mới tạo luồng 1, mất hoàn toàn tính song song."
        },
        {
          "lines": "Dòng 39–43",
          "title": "Bước Reduce tuần tự & in kết quả cuối cùng",
          "code": "    long long ans = 0;\n    for (int i = 0; i < T; i++) ans += counts[i];\n    printf(\"%lld\\n\", ans);\n    return 0;\n}",
          "explain": "Sau khi toàn bộ lệnh pthread_join() kết thúc, hệ điều hành đảm bảo mọi thao tác ghi counts[i] của các luồng con đã hiển thị đầy đủ về bộ nhớ (memory visibility / happens-before). Luồng chính cộng dồn T phần tử (T <= 16 chỉ tốn vài nano giây) vào biến ans kiểu long long, in kết quả bằng %lld kèm xuống dòng \\n và kết thúc chương trình với mã thoát 0."
        }
      ],
      "testCases": [
        {
          "name": "Đoạn chuẩn chia đều",
          "caseDesc": "L = 1, R = 20, d = 3, T = 4",
          "howHandled": "total = 20 chia đều mỗi luồng 5 số: [1..5] đếm {3}, [6..10] đếm {9}, [11..15] đếm {15}, [16..20] đếm 0 → tổng ans = 3."
        },
        {
          "name": "Đoạn không chia hết cho T",
          "caseDesc": "L = 1, R = 10, d = 1, T = 3",
          "howHandled": "total = 10, base = 3, rem = 1 → tid 0 xử lý [1..4] (2 số lẻ), tid 1 xử lý [5..7] (2 số lẻ), tid 2 xử lý [8..10] (1 số lẻ) → tổng 5, không trùng hay sót."
        },
        {
          "name": "Số luồng lớn hơn độ dài đoạn (T > total)",
          "caseDesc": "L = 9, R = 9, d = 3, T = 8",
          "howHandled": "total = 1, base = 0, rem = 1 → tid 0 nhận [9, 9] đếm được 1; tid 1..7 nhận len = 0 nên end = start - 1, vòng lặp chạy 0 lần và ghi 0 → ans = 1."
        },
        {
          "name": "Khoảng lớn cực đại tới 10^7",
          "caseDesc": "L = 1, R = 10000000, d = 1, T = 16",
          "howHandled": "Mọi biến tính chỉ số và bộ đếm đều dùng long long, local_cnt nằm trên thanh ghi chạy cực nhanh không khóa mutex → trả về chính xác 5000000."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <pthread.h> và các biến toàn cục: long long L, R, d, counts[20]; int T;.",
        "Trong worker(void *arg), lấy tid = *(int *)arg rồi áp công thức phân hoạch Foster: total = R - L + 1; base = total / T; rem = total % T; tính start, len, end.",
        "Khởi tạo long long local_cnt = 0; chạy vòng for (long long x = start; x <= end; x++) kiểm tra (x % 2 != 0 && x % d == 0) tăng local_cnt++.",
        "Ra khỏi vòng lặp mới ghi 1 lần counts[tid] = local_cnt; rồi return NULL;.",
        "Trong main(): đọc input, dùng mảng ids[i] = i để pthread_create() đủ T luồng, gọi vòng pthread_join() riêng biệt, sau đó cộng counts[0..T-1] và in bằng %lld."
      ]
    }
  },
  {
    "num": 26,
    "id": "CR-26",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Dễ",
    "title": "Tính tổng bình phương mảng theo phân hoạch tĩnh không chia hết",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Cho mảng gồm n số nguyên và số luồng T. Phân hoạch tĩnh (static mapping) dãy n phần tử cho T luồng sao cho phần dư n % T được chia đều cho các luồng đầu tiên (bảo đảm xử lý đúng khi n không chia hết cho T hoặc khi T > n mà không bỏ sót hay trùng lặp phần tử). Mỗi luồng tích lũy tổng bình phương vào biến cục bộ rồi lưu vào partial[tid]. Sau pthread_join(), luồng chính tính tổng cuối và in kết quả.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create() và pthread_join() kết hợp phân hoạch tĩnh xử lý được mọi n, T.",
      "Mỗi luồng tích lũy vào biến cục bộ (local variable) kiểu long long rồi ghi 1 lần vào mảng kết quả riêng."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n T. Dòng 2: n số nguyên a_0, ..., a_{n-1}.",
    "outputSpec": "Một số nguyên (long long) là tổng bình phương tất cả n phần tử.",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= T <= 16",
      "-10^4 <= a_i <= 10^4"
    ],
    "example": {
      "note": "1^2 + (-2)^2 + 3^2 + 0^2 + 4^2 + (-5)^2 + 2^2 = 1 + 4 + 9 + 0 + 16 + 25 + 4 = 59.",
      "input": "7 3\n1 -2 3 0 4 -5 2",
      "output": "59"
    },
    "relatedTopics": [
      {
        "id": "5-4",
        "label": "5.4 Phân hoạch Tĩnh & Cân bằng Tải (Load Balancing)"
      },
      {
        "id": "5-7",
        "label": "5.7 Bẫy bỏ sót phần dư n % T trong psum"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Công thức chia cân bằng kinh điển cho luồng i (0 <= i < T): len = (n / T) + (i < (n % T) ? 1 : 0). Nếu T > n thì các luồng từ i >= n tự động nhận len = 0 (đoạn rỗng an toàn) mà không bao giờ đọc tràn mảng!",
    "relatedQuestions": [
      "CR-25",
      "CR-27"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint n, T;\nint *a;\nlong long partial[20];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);\n\n    long long local_sum = 0;\n    for (int i = start; i < end; i++) {\n        local_sum += (long long)a[i] * a[i];\n    }\n    partial[tid] = local_sum;\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d\", &n, &T);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    long long total = 0;\n    for (int i = 0; i < T; i++) total += partial[i];\n    printf(\"%lld\\n\", total);\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Phân phối phần dư rem = n % T mỗi luồng đầu nhận thêm 1 phần tử giúp chênh lệch khối lượng giữa mọi luồng không quá 1 phần tử (tối ưu cân bằng tải hơn việc dồn hết phần dư cho luồng cuối).",
      "Ép sang long long v = t->arr[i] trước khi nhân v * v để không tràn số."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "pthread_mutex_lock"
      ],
      "qualityRules": [
        {
          "desc": "Xử lý phần dư n % T không bỏ sót phần tử cuối mảng",
          "regex": "%|\\brem\\b|==\\s*T\\s*-\\s*1",
          "flags": ""
        },
        {
          "desc": "Tính bình phương trên kiểu long long tránh tràn số",
          "regex": "long\\s+long",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 5 — Phân hoạch tĩnh không chia hết (Static Mapping nửa mở [start, end)) & biến tích lũy cục bộ chống tràn (Mục 5.4, 5.7).",
      "idea": {
        "summary": "Bài toán yêu cầu tính tổng bình phương S = a[0]^2 + a[1]^2 + ... + a[n-1]^2 bằng T luồng trên một mảng độ dài n bất kỳ (kể cả khi n không chia hết cho T hoặc T > n). Ta phân hoạch dãy chỉ số [0, n) thành T đoạn nửa mở [start, end) cân bằng tải tối đa (chênh nhau nhiều nhất 1 phần tử), mỗi luồng cộng dồn vào biến cục bộ kiểu long long rồi gộp tại luồng chính.",
        "steps": [
          "Bước 1 — Đọc kích thước và cấp phát mảng động: Luồng chính đọc n, T, cấp phát mảng a gồm n phần tử kiểu int trên Heap bằng malloc() rồi đọc đủ n số nguyên.",
          "Bước 2 — Phân hoạch nửa mở [start, end): Trong mỗi luồng tid, tính base = n / T, rem = n % T; đặt start = tid * base + min(tid, rem) và end = start + base + (tid < rem ? 1 : 0).",
          "Bước 3 — Tích lũy bình phương cục bộ: Duyệt i từ start đến end - 1, ép kiểu (long long)a[i] * a[i] trước khi cộng vào biến cục bộ local_sum để tuyệt đối không tràn số 32-bit.",
          "Bước 4 — Ghi kết quả riêng & chờ đồng bộ: Ghi 1 lần partial[tid] = local_sum; luồng chính gọi pthread_join() chờ đủ T luồng hoàn tất.",
          "Bước 5 — Reduce & dọn dẹp bộ nhớ: Cộng dồn partial[0..T-1] ra kết quả total, in bằng %lld và gọi free(a) sau khi tất cả luồng đã kết thúc."
        ],
        "whyThisWay": "Phân hoạch tĩnh nửa mở [start, end) với phần dư chia cho rem luồng đầu tiên đảm bảo cân bằng tải tối ưu (không luồng nào phải gánh toàn bộ phần dư như cách dồn hết cho luồng cuối) và tự động xử lý an toàn trường hợp T > n (các luồng thừa có start == end nên chạy 0 vòng). Tích lũy vào local_sum trên stack loại bỏ hoàn toàn tranh chấp mutex và False Sharing.",
        "complexity": "Thời gian: O(n / T + T) · Bộ nhớ: O(n) trên Heap cho mảng a + O(T) cho partial[] · Tài nguyên: T luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–7",
          "title": "Khai báo thư viện & biến toàn cục chia sẻ giữa các luồng",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\nint n, T;\nint *a;\nlong long partial[20];",
          "explain": "Thêm <stdlib.h> để dùng malloc() và free() cấp phát động mảng a có kích thước tới 10^5 phần tử trên vùng nhớ Heap (an toàn, không lo tràn Stack). Con trỏ a toàn cục được tất cả luồng dùng chung ở chế độ chỉ đọc (read-only) sau khi main nạp xong dữ liệu nên không cần mutex. Mảng partial[20] dùng kiểu long long vì tổng bình phương tối đa lên tới 10^5 × (10^4)^2 = 10^13, vượt xa giới hạn ~2.14×10^9 của kiểu int."
        },
        {
          "lines": "Dòng 9–14",
          "title": "Phân hoạch tĩnh nửa mở [start, end) cân bằng phần dư",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);",
          "explain": "Dùng đoạn nửa mở [start, end) (gồm các chỉ số start, start+1, ..., end-1) là chuẩn lập trình C vì độ dài đoạn đúng bằng (end - start) và không bao giờ phải trừ 1 gây nhầm lẫn biên. Ví dụ n = 10, T = 3 → base = 3, rem = 1: tid 0 lấy [0, 4) (4 phần tử), tid 1 lấy [4, 7) (3 phần tử), tid 2 lấy [7, 10) (3 phần tử). Nếu T > n (ví dụ n = 2, T = 5 → base = 0, rem = 2): tid 0 lấy [0, 1), tid 1 lấy [1, 2), còn tid 2..4 đều có start = 2, end = 2 (đoạn rỗng), tuyệt đối không truy cập vượt mảng."
        },
        {
          "lines": "Dòng 15–21",
          "title": "Tích lũy bình phương cục bộ & ép kiểu chống tràn 32-bit",
          "code": "    long long local_sum = 0;\n    for (int i = start; i < end; i++) {\n        local_sum += (long long)a[i] * a[i];\n    }\n    partial[tid] = local_sum;\n    return NULL;\n}",
          "explain": "LƯU Ý QUAN TRỌNG VỀ ÉP KIỂU: Trong C, vì a[i] có kiểu int nên phép nhân a[i] * a[i] nếu KHÔNG có (long long) sẽ được tính theo số học 32-bit trước rồi mới chuyển sang long long để cộng vào local_sum — khi |a[i]| > 46340 sẽ tràn số âm! Ép kiểu (long long)a[i] * a[i] buộc phép nhân thực hiện ở độ rộng 64-bit ngay từ đầu. Đồng thời, cộng dồn vào biến cục bộ local_sum thay vì partial[tid] giúp giữ dữ liệu trên thanh ghi CPU và tránh False Sharing giữa các luồng."
        },
        {
          "lines": "Dòng 23–27",
          "title": "Đọc dữ liệu đầu vào & cấp phát mảng động trên Heap",
          "code": "int main() {\n    scanf(\"%d %d\", &n, &T);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);",
          "explain": "Luồng chính đọc n và T, sau đó xin cấp phát đúng n * sizeof(int) byte từ Heap bằng malloc() và nạp đủ n phần tử a[0..n-1]. Việc nạp xong toàn bộ mảng a TRƯỚC khi gọi pthread_create() bảo đảm mọi luồng con đều thấy dữ liệu đầy đủ, không cần khóa khi đọc."
        },
        {
          "lines": "Dòng 28–34",
          "title": "Khởi tạo T luồng worker & chờ đồng bộ bằng pthread_join()",
          "code": "    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);",
          "explain": "Mảng th[20] lưu định danh (handle) của từng luồng, còn mảng ids[20] giữ bản sao cố định của chỉ số luồng 0..T-1 để truyền con trỏ &ids[i] an toàn (tránh race condition khi truyền &i). Vòng lặp pthread_join() riêng phía sau chặn luồng chính cho tới khi cả T luồng đều đã thực thi xong lệnh ghi partial[tid] = local_sum."
        },
        {
          "lines": "Dòng 36–41",
          "title": "Gộp tổng cục bộ (Reduce), in kết quả & giải phóng Heap",
          "code": "    long long total = 0;\n    for (int i = 0; i < T; i++) total += partial[i];\n    printf(\"%lld\\n\", total);\n    free(a);\n    return 0;\n}",
          "explain": "Luồng chính cộng dồn T phần tử của mảng partial[] vào biến total kiểu long long rồi in kết quả bằng %lld. Cuối cùng gọi free(a) để trả bộ nhớ Heap cho hệ điều hành — lưu ý BẮT BUỘC gọi free(a) SAU vòng pthread_join(), nếu giải phóng trước khi các luồng kết thúc sẽ gây lỗi Use-After-Free (Segmentation Fault)."
        }
      ],
      "testCases": [
        {
          "name": "n không chia hết cho T (có số âm và số 0)",
          "caseDesc": "n = 5, T = 3, a = [-3, 0, 2, -1, 4]",
          "howHandled": "tid 0 xử lý [-3, 0] → 9; tid 1 xử lý [2, -1] → 5; tid 2 xử lý [4] → 16. Bình phương số âm ra dương → tổng = 30."
        },
        {
          "name": "Số luồng lớn hơn số phần tử (T > n)",
          "caseDesc": "n = 2, T = 8, a = [5, -6]",
          "howHandled": "base = 0, rem = 2 → tid 0 xử lý a[0] (25), tid 1 xử lý a[1] (36), tid 2..7 nhận đoạn rỗng [2, 2) trả về 0 → tổng = 61."
        },
        {
          "name": "Biên nhỏ nhất (n = 1, T = 1)",
          "caseDesc": "n = 1, T = 1, a = [-10000]",
          "howHandled": "tid 0 xử lý [0, 1), tính (-10000)^2 = 100000000 chính xác bằng long long."
        },
        {
          "name": "Tránh tràn số 32-bit ở quy mô tối đa",
          "caseDesc": "n = 10^5, T = 16, mọi a[i] = 10000",
          "howHandled": "Tổng thực tế là 10^5 × 10^8 = 10^13 (vượt quá int 32-bit ~2.14×10^9); nhờ local_sum và partial[] kiểu long long nên không bị tràn."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <stdlib.h>, <pthread.h> cùng biến toàn cục: int n, T, *a; long long partial[20];.",
        "Trong worker(), rút tid = *(int *)arg và tính phân hoạch nửa mở [start, end) với base = n / T, rem = n % T.",
        "Tích lũy long long local_sum = 0; vòng for (int i = start; i < end; i++) cộng (long long)a[i] * a[i], rồi gán 1 lần partial[tid] = local_sum;.",
        "Trong main(): scanf n, T, malloc mảng a, đọc mảng, tạo T luồng với mảng ids[i] riêng rồi gọi pthread_join() tất cả.",
        "Cộng dồn partial[0..T-1] ra total, in %lld, sau đó gọi free(a) và return 0."
      ]
    }
  },
  {
    "num": 27,
    "id": "CR-27",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Dễ",
    "title": "Tính tích vô hướng hai vector song song bằng T luồng",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Cho hai vector số nguyên A, B cùng độ dài n và số luồng T. Tạo tối đa min(n, T) luồng (hoặc T luồng với những luồng thừa xử lý đoạn rỗng), mỗi luồng tính tổng tích A[i] * B[i] trên đoạn chỉ số được phân công vào biến cục bộ và lưu vào partial[tid]. Sau khi chờ toàn bộ luồng kết thúc bằng pthread_join(), luồng chính cộng tất cả tổng cục bộ và in tích vô hướng.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create() và pthread_join(); không khóa mutex ở từng phần tử.",
      "Tính toán bằng kiểu long long để không bị tràn int."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n T. Dòng 2: n số nguyên của vector A. Dòng 3: n số nguyên của vector B.",
    "outputSpec": "Một số nguyên (long long) là tích vô hướng sum_{i=0..n-1} A[i]*B[i].",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= T <= 16",
      "-10^4 <= A_i, B_i <= 10^4"
    ],
    "example": {
      "note": "2*5 + (-1)*6 + 4*(-2) + 3*1 + 0*9 = 10 - 6 - 8 + 3 + 0 = -1.",
      "input": "5 2\n2 -1 4 3 0\n5 6 -2 1 9",
      "output": "-1"
    },
    "relatedTopics": [
      {
        "id": "5-2",
        "label": "5.2 Kiến trúc Bộ nhớ Dùng chung (Shared Memory)"
      },
      {
        "id": "5-7",
        "label": "5.7 Mẫu Map-Reduce không khóa trên Pthreads"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: So sánh với Câu 15 (dùng fork + pipe phải sao chép qua nhân): trên bộ nhớ dùng chung Pthreads, tất cả T luồng đọc trực tiếp hai mảng A, B trong cùng không gian địa chỉ mà không tốn bất kỳ chi phí IPC nào.",
    "relatedQuestions": [
      "CR-15",
      "CR-26",
      "CR-30"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint n, T;\nint *A, *B;\nlong long partial[20];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);\n\n    long long local_sum = 0;\n    for (int i = start; i < end; i++) {\n        local_sum += (long long)A[i] * B[i];\n    }\n    partial[tid] = local_sum;\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d\", &n, &T);\n    A = (int *)malloc(n * sizeof(int));\n    B = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &A[i]);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &B[i]);\n\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    long long dot = 0;\n    for (int i = 0; i < T; i++) dot += partial[i];\n    printf(\"%lld\\n\", dot);\n\n    free(A);\n    free(B);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Nhân với 1LL (1LL * t->A[i] * t->B[i]) nâng phép nhân lên 64-bit trước khi cộng dồn vào lsum.",
      "Hoàn toàn không sử dụng khóa đồng bộ trong vòng lặp trong, đạt tốc độ băng thông RAM tối đa."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "pthread_mutex_lock",
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Sử dụng kiểu long long tránh tràn tích vô hướng",
          "regex": "long\\s+long|1LL",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 5 — Lập trình song song dữ liệu (Data Parallelism): Tích vô hướng hai vector (Dot Product · Mục 5.1, 5.7).",
      "idea": {
        "summary": "Tích vô hướng (dot product) của hai vector A và B độ dài n là tổng các tích tương ứng A[i] * B[i] với i từ 0 đến n - 1. Vì mỗi phép nhân A[i] * B[i] hoàn toàn độc lập nhau và phép cộng có tính kết hợp, đây là bài toán Song song Dữ liệu (Map-Reduce) điển hình: chia đều dãy chỉ số [0, n) cho T luồng tính tổng cục bộ rồi cộng gộp sau khi đồng bộ.",
        "steps": [
          "Bước 1 — Nạp dữ liệu: Luồng chính đọc n, T, cấp phát động hai mảng A, B trên Heap rồi đọc lần lượt n phần tử của A và n phần tử của B.",
          "Bước 2 — Phân hoạch đồng nhất chỉ số: Mỗi luồng tid nhận đoạn chỉ số nửa mở [start, end) trên cả A và B bằng công thức chia phần dư cân bằng.",
          "Bước 3 — Pha Map (nhân & cộng cục bộ): Mỗi luồng duyệt i từ start đến end - 1, tính (long long)A[i] * B[i] và cộng dồn vào biến thanh ghi local_sum.",
          "Bước 4 — Ghi kết quả riêng & đồng bộ: Mỗi luồng lưu 1 lần partial[tid] = local_sum rồi thoát; main() gọi pthread_join() chờ đủ T luồng.",
          "Bước 5 — Pha Reduce & giải phóng bộ nhớ: Luồng chính cộng dồn partial[0..T-1] ra biến dot, in kết quả bằng %lld và gọi free(A), free(B)."
        ],
        "whyThisWay": "Phép tính tích vô hướng có tỷ lệ tính toán trên mỗi phần tử nhỏ (1 nhân + 1 cộng); nếu dùng mutex cộng vào một biến dot toàn cục ở mỗi bước, chi phí khóa mutex lớn gấp hàng trăm lần bản thân phép nhân cộng! Việc để mỗi luồng quét tuần tự (stride = 1) hai mảng A, B trên đoạn [start, end) vừa tối ưu bộ nhớ đệm CPU (spatial locality), vừa triệt tiêu 100% nghẽn đồng bộ và False Sharing.",
        "complexity": "Thời gian: O(n / T + T) · Bộ nhớ: O(n) (hai mảng A, B) + O(T) (mảng partial[20]) · Tài nguyên: T luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–7",
          "title": "Khai báo thư viện & hai con trỏ vector dùng chung",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\nint n, T;\nint *A, *B;\nlong long partial[20];",
          "explain": "Hai con trỏ int *A, *B lưu địa chỉ hai mảng cấp phát động trên Heap; mọi luồng đều chia sẻ chung không gian địa chỉ của tiến trình nên đọc trực tiếp A[i], B[i] mà không cần sao chép. Mảng partial[20] dùng kiểu long long có dấu (signed 64-bit) vì tích vô hướng có thể âm, bằng 0 hoặc đạt tới ±10^5 × 10^8 = ±10^13 (vượt xa giới hạn 32-bit int)."
        },
        {
          "lines": "Dòng 9–14",
          "title": "Phân hoạch chỉ số [start, end) đồng bộ trên cả A và B",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);",
          "explain": "Mỗi luồng nhận chỉ số tid (0..T-1) và tính đoạn nửa mở [start, end) phụ trách. Vì các đoạn [start, end) của T luồng hoàn toàn rời nhau và phủ kín [0, n), mỗi cặp (A[i], B[i]) được xử lý đúng 1 lần. Trường hợp T > n, các luồng từ tid = n trở đi tự động nhận start == end == n nên không xử lý phần tử nào."
        },
        {
          "lines": "Dòng 15–21",
          "title": "Tính tổng tích cục bộ & ghi một lần ra partial[tid]",
          "code": "    long long local_sum = 0;\n    for (int i = start; i < end; i++) {\n        local_sum += (long long)A[i] * B[i];\n    }\n    partial[tid] = local_sum;\n    return NULL;\n}",
          "explain": "Vòng lặp truy cập A[i] và B[i] liên tiếp trong RAM (bước nhảy 1 phần tử), giúp bộ nạp trước phần cứng (hardware prefetcher) của CPU nạp sẵn dữ liệu vào L1 cache. Ép kiểu (long long)A[i] * B[i] đảm bảo phép nhân thực hiện ở 64-bit có dấu (giữ nguyên dấu âm nếu A[i] và B[i] trái dấu). Biến local_sum nằm cục bộ giúp không cần mutex và không gây False Sharing khi ghi vào partial[tid] 1 lần duy nhất ở dòng 19."
        },
        {
          "lines": "Dòng 23–28",
          "title": "Cấp phát động & đọc hai vector A, B từ đầu vào chuẩn",
          "code": "int main() {\n    scanf(\"%d %d\", &n, &T);\n    A = (int *)malloc(n * sizeof(int));\n    B = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &A[i]);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &B[i]);",
          "explain": "Đọc kích thước n và số luồng T, cấp phát đủ bộ nhớ cho A và B, rồi đọc tuần tự hết vector A trước khi đọc vector B theo đúng đặc tả đầu vào (dòng 2 là A, dòng 3 là B). Mọi thao tác đọc hoàn tất trước khi tạo luồng nên A và B trở thành bất biến (read-only) trong suốt pha tính song song."
        },
        {
          "lines": "Dòng 30–36",
          "title": "Tạo T luồng song song & chờ hoàn tất bằng pthread_join()",
          "code": "    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);",
          "explain": "Sử dụng mảng ids[20] để mỗi luồng nhận địa chỉ riêng &ids[i], tránh lỗi race condition nếu truyền &i. Tách biệt hoàn toàn vòng pthread_create() và vòng pthread_join() để tất cả T luồng thực sự chạy đồng thời trên các nhân CPU trước khi luồng chính thu gom kết quả."
        },
        {
          "lines": "Dòng 38–45",
          "title": "Cộng gộp tích vô hướng (Reduce), in kết quả & giải phóng bộ nhớ",
          "code": "    long long dot = 0;\n    for (int i = 0; i < T; i++) dot += partial[i];\n    printf(\"%lld\\n\", dot);\n    free(A);\n    free(B);\n    return 0;\n}",
          "explain": "Cộng dồn T tổng bộ phận vào biến dot kiểu long long, in ra màn hình bằng %lld. Cuối cùng giải phóng cả hai mảng động A và B bằng free(A) và free(B) sau khi đã join hết luồng để tránh rò rỉ bộ nhớ (memory leak) và lỗi truy cập vùng nhớ đã giải phóng."
        }
      ],
      "testCases": [
        {
          "name": "Vector vuông góc (tích vô hướng bằng 0)",
          "caseDesc": "n = 4, T = 2, A = [1, 2, -1, -2], B = [2, -1, -2, 1]",
          "howHandled": "Các tích âm và dương triệt tiêu nhau hoàn toàn (2 - 2 + 2 - 2 = 0) → in ra 0."
        },
        {
          "name": "Tích vô hướng mang giá trị âm & n không chia hết cho T",
          "caseDesc": "n = 5, T = 4, A = [-10, 5, -3, 2, -4], B = [3, -2, 4, -5, 1]",
          "howHandled": "tid 0 xử lý 2 phần tử (-30 - 10 = -40), tid 1..3 mỗi luồng 1 phần tử (-12, -10, -4) → dot = -66, kiểu long long có dấu giữ đúng dấu âm."
        },
        {
          "name": "Số luồng lớn hơn độ dài vector (T > n)",
          "caseDesc": "n = 1, T = 10, A = [10000], B = [-10000]",
          "howHandled": "tid 0 tính -100000000, tid 1..9 xử lý đoạn rỗng trả về 0 → kết quả chính xác -100000000."
        },
        {
          "name": "Biên lớn nhất chống tràn 32-bit",
          "caseDesc": "n = 10^5, T = 16, A[i] = 10000, B[i] = -10000",
          "howHandled": "dot = -10^13; ép kiểu (long long)A[i] * B[i] cùng biến tổng long long tính chính xác tuyệt đối."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <stdlib.h>, <pthread.h>; biến toàn cục int n, T, *A, *B; long long partial[20];.",
        "Trong worker(): lấy tid, tính đoạn nửa mở [start, end) theo base = n / T, rem = n % T.",
        "Khởi tạo local_sum = 0; duyệt i từ start đến end - 1 cộng (long long)A[i] * B[i]; ghi 1 lần partial[tid] = local_sum;.",
        "Trong main(): đọc n, T, malloc và đọc đủ 2 vector A, B rồi tạo T luồng với ids[i] và gọi pthread_join().",
        "Cộng dồn partial[0..T-1] ra dot, in %lld, sau đó gọi free(A); free(B);."
      ]
    }
  },
  {
    "num": 28,
    "id": "CR-28",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Trung bình",
    "title": "Tính Histogram tần suất điểm ảnh song song (Local Histogram + Reduce)",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Cho mảng gồm n giá trị pixel nguyên trong [0, 255] và số luồng T. Áp dụng kỹ thuật Map-Reduce trên bộ nhớ dùng chung: mỗi luồng tự tạo mảng tần suất cục bộ local_hist[256] (khởi tạo 0) để đếm phân bố trên phần mảng được giao (hoàn toàn không dùng mutex trong lúc đếm). Sau khi pthread_join(), luồng chính gộp toàn bộ local_hist về mảng hist[256] chung và xác định: (1) số giá trị pixel phân biệt xuất hiện ít nhất 1 lần, (2) giá trị pixel xuất hiện nhiều nhất (nếu hòa, chọn giá trị nhỏ nhất), và (3) tần suất lớn nhất đó.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create(), pthread_join() và mảng đếm cục bộ riêng cho mỗi luồng trước bước Reduce.",
      "Không dùng một mảng hist[256] toàn cục kèm mutex để cập nhật từng pixel."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n T. Dòng 2: n số nguyên trong đoạn [0, 255].",
    "outputSpec": "Ba số nguyên trên 1 dòng: <số_giá_trị_khác_nhau> <giá_trị_mode> <tần_suất_mode>.",
    "constraints": [
      "1 <= n <= 10^6",
      "1 <= T <= 16",
      "0 <= pixel <= 255"
    ],
    "example": {
      "note": "Có 4 mức xám khác nhau {0, 2, 5, 10}; giá trị 2 xuất hiện nhiều nhất (3 lần).",
      "input": "8 3\n5 2 5 10 2 0 10 2",
      "output": "4 2 3"
    },
    "relatedTopics": [
      {
        "id": "5-4",
        "label": "5.4 Bước Agglomeration & Mapping trong thiết kế Foster"
      },
      {
        "id": "6-3",
        "label": "6.3 Tại sao Local Histogram vừa tránh Mutex vừa nằm gọn trong L1 Cache"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Một mảng local_hist[256] kiểu int chỉ chiếm đúng 256 * 4 = 1 KB — nằm gọn hoàn toàn trong L1 Data Cache (32 KB) của riêng từng lõi CPU! Nhờ vậy mỗi phép tăng tần suất chỉ mất ~1 chu kỳ nhịp mà không có bất kỳ xung đột dòng cache nào giữa các luồng.",
    "relatedQuestions": [
      "CR-25",
      "CR-26"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint n, T;\nint *pixels;\nlong long local_hist[20][256];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);\n\n    long long my_hist[256] = {0};\n    for (int i = start; i < end; i++) {\n        my_hist[pixels[i]]++;\n    }\n    for (int v = 0; v < 256; v++) {\n        local_hist[tid][v] = my_hist[v];\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d\", &n, &T);\n    pixels = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &pixels[i]);\n\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    long long hist[256] = {0};\n    for (int t = 0; t < T; t++) {\n        for (int v = 0; v < 256; v++) hist[v] += local_hist[t][v];\n    }\n\n    int distinct = 0, mode_val = 0;\n    long long mode_freq = -1;\n    for (int v = 0; v < 256; v++) {\n        if (hist[v] > 0) distinct++;\n        if (hist[v] > mode_freq) {\n            mode_freq = hist[v];\n            mode_val = v;\n        }\n    }\n\n    printf(\"%d %d %lld\\n\", distinct, mode_val, mode_freq);\n    free(pixels);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Đếm trực tiếp trên mảng h[256] nằm trên Stack riêng của từng luồng (cách ly tuyệt đối khỏi bộ nhớ của luồng khác, 0% False Sharing), sau đó mới memcpy một lần ra local_hist[tid].",
      "Khi quét v từ 0 đến 255 tìm mode, dùng dấu so sánh nghiêm ngặt hist[v] > mode_freq tự động ưu tiên giá trị v nhỏ nhất nếu bằng tần suất."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "pthread_mutex_lock"
      ],
      "qualityRules": [
        {
          "desc": "Sử dụng mảng tần suất 256 phần tử cục bộ cho từng luồng",
          "regex": "\\[\\s*256\\s*\\]",
          "flags": ""
        },
        {
          "desc": "Ưu tiên pixel nhỏ nhất khi hòa tần suất bằng dấu so sánh nghiêm ngặt >",
          "regex": ">\\s*mode_freq|mode_freq\\s*<",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 5 — Kỹ thuật Tư nhân hóa / Map-Reduce cục bộ tính Histogram tần suất điểm ảnh song song (Lab 5 Bài 2).",
      "idea": {
        "summary": "Histogram (lược đồ tần suất) đếm số lần xuất hiện của mỗi giá trị điểm ảnh trong khoảng [0, 255] trên mảng n phần tử (n tới 10^6). Thay vì để T luồng tranh nhau cập nhật một mảng hist[256] chung bằng mutex, ta áp dụng kỹ thuật Map-Reduce (Privatization): mỗi luồng tự đếm trên bảng cục bộ my_hist[256] của riêng mình rồi chép ra local_hist[tid][256]; sau pthread_join(), luồng chính gộp tất cả bảng cục bộ thành hist[256] và rút ra 3 chỉ số thống kê.",
        "steps": [
          "Bước 1 — Nạp mảng điểm ảnh: Luồng chính đọc n, T, cấp phát động mảng pixels[n] và đọc toàn bộ n giá trị pixel (mỗi giá trị nằm trong [0, 255]).",
          "Bước 2 — Phân hoạch dữ liệu (Map): Chia mảng pixels thành T đoạn nửa mở [start, end) rời nhau cho T luồng xử lý đồng thời.",
          "Bước 3 — Đếm trên bảng cục bộ (Privatization): Mỗi luồng tạo mảng cục bộ my_hist[256] = {0} trên Stack (chỉ 2 KB, nằm gọn trong L1 cache), duyệt đoạn được giao và tăng my_hist[pixels[i]]++ không cần bất kỳ khóa mutex nào.",
          "Bước 4 — Xuất kết quả luồng & đồng bộ: Kết thúc vòng đếm, mỗi luồng chép 256 giá trị sang hàng riêng local_hist[tid][0..255]; luồng chính chờ tất cả bằng pthread_join().",
          "Bước 5 — Pha Reduce & thống kê: Luồng chính cộng gộp T hàng local_hist[t][v] vào hist[v] chung (tối đa 16 × 256 = 4096 phép cộng), sau đó quét v từ 0 đến 255 để đếm số giá trị phân biệt (distinct) và tìm mode nhỏ nhất có tần suất lớn nhất."
        ],
        "whyThisWay": "Nếu dùng 1 mảng hist[256] toàn cục kèm mutex cho n = 10^6 pixel, chương trình phải khóa/mở mutex 1 triệu lần nên chậm hơn cả chạy 1 luồng! Nếu dùng mảng toàn cục không khóa sẽ gặp race condition (mất lượt đếm, tổng tần suất < n). Kỹ thuật tạo bảng cục bộ riêng cho mỗi luồng biến thao tác đếm O(n) thành hoàn toàn song song không khóa, còn bước gộp Reduce chỉ tốn O(256 × T) cực nhỏ (vài micro giây).",
        "complexity": "Thời gian: O(n / T + 256 · T) · Bộ nhớ: O(n) cho pixels + O(256 · T) (~40 KB) cho local_hist · Tài nguyên: T luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–7",
          "title": "Khai báo thư viện & bảng tần suất cục bộ 2 chiều",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\nint n, T;\nint *pixels;\nlong long local_hist[20][256];",
          "explain": "Mảng toàn cục local_hist[20][256] cung cấp cho mỗi luồng tid một hàng riêng gồm 256 ô kiểu long long (tương ứng 256 mức xám 0..255). Mỗi hàng dài 256 × 8 = 2048 byte — là bội số chính xác của dòng cache 64 byte, nên hai luồng khác nhau tuyệt đối không bị False Sharing khi ghi vào hàng của mình."
        },
        {
          "lines": "Dòng 9–14",
          "title": "Phân hoạch tĩnh mảng điểm ảnh cho từng luồng",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);",
          "explain": "Chia đều n phần tử của mảng pixels cho T luồng theo công thức nửa mở [start, end), phân bổ phần dư rem cho các luồng đầu tiên. Khi T > n, các luồng dư có start == end nên vòng đếm chạy 0 lần và ghi toàn số 0 ra local_hist[tid]."
        },
        {
          "lines": "Dòng 15–23",
          "title": "Đếm tần suất trên Stack (my_hist[256]) & chép ra bảng chung",
          "code": "    long long my_hist[256] = {0};\n    for (int i = start; i < end; i++) {\n        my_hist[pixels[i]]++;\n    }\n    for (int v = 0; v < 256; v++) {\n        local_hist[tid][v] = my_hist[v];\n    }\n    return NULL;\n}",
          "explain": "Câu lệnh long long my_hist[256] = {0}; khởi tạo toàn bộ 256 phần tử bằng 0 trên Stack riêng của luồng (cực nhanh và thân thiện với L1 cache). Phép my_hist[pixels[i]]++ dùng chính giá trị pixel làm chỉ số mảng (đánh địa chỉ trực tiếp O(1)), không cần tìm kiếm hay khóa mutex. Sau khi đếm xong toàn bộ đoạn [start, end), luồng chép 256 ô sang local_hist[tid][v] một lần duy nhất rồi trả về NULL."
        },
        {
          "lines": "Dòng 25–36",
          "title": "Nạp mảng pixels, khởi chạy T luồng & đồng bộ bằng pthread_join()",
          "code": "int main() {\n    scanf(\"%d %d\", &n, &T);\n    pixels = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &pixels[i]);\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);",
          "explain": "Cấp phát mảng pixels trên Heap vì n có thể lên tới 10^6 (4 MB — nếu khai báo mảng cục bộ trên Stack dễ gây Stack Overflow!). Đọc xong dữ liệu rồi mới tạo T luồng với mảng ids[i] riêng và chờ toàn bộ hoàn tất bằng pthread_join()."
        },
        {
          "lines": "Dòng 38–41",
          "title": "Pha Reduce: Gộp T bảng tần suất cục bộ về hist[256]",
          "code": "    long long hist[256] = {0};\n    for (int t = 0; t < T; t++) {\n        for (int v = 0; v < 256; v++) hist[v] += local_hist[t][v];\n    }",
          "explain": "Khởi tạo bảng tổng hist[256] = {0}. Vòng lặp ngoài duyệt theo luồng t, vòng trong duyệt theo giá trị v = 0..255 giúp truy cập bộ nhớ liên tiếp theo hàng trên local_hist[t][v] (tối ưu cache). Tổng số phép cộng tối đa chỉ là 16 × 256 = 4096 phép, thực hiện gần như tức thời."
        },
        {
          "lines": "Dòng 43–56",
          "title": "Tính distinct, mode (ưu tiên giá trị nhỏ nhất), in kết quả & free()",
          "code": "    int distinct = 0, mode_val = 0;\n    long long mode_freq = -1;\n    for (int v = 0; v < 256; v++) {\n        if (hist[v] > 0) distinct++;\n        if (hist[v] > mode_freq) {\n            mode_freq = hist[v];\n            mode_val = v;\n        }\n    }\n    printf(\"%d %d %lld\\n\", distinct, mode_val, mode_freq);\n    free(pixels);\n    return 0;\n}",
          "explain": "Quét v tăng dần từ 0 đến 255: mỗi mức pixel có hist[v] > 0 làm tăng distinct thêm 1. CHÚ Ý CHI TIẾT XỬ LÝ HÒA (TIE-BREAKING): đặt mode_freq = -1 và dùng phép so sánh chặt (>) hist[v] > mode_freq (tuyệt đối KHÔNG dùng >=). Nhờ duyệt v từ nhỏ đến lớn và chỉ cập nhật khi tần suất thực sự lớn hơn, nếu nhiều giá trị pixel cùng có tần suất cao nhất thì mode_val tự động giữ lại giá trị pixel NHỎ NHẤT đúng yêu cầu đề bài! Cuối cùng in 3 số trên 1 dòng và giải phóng pixels."
        }
      ],
      "testCases": [
        {
          "name": "Nhiều giá trị pixel hòa tần suất lớn nhất (tie-breaking)",
          "caseDesc": "n = 6, T = 2, pixels = [200, 10, 200, 10, 50, 50]",
          "howHandled": "hist[10] = hist[50] = hist[200] = 2. Nhờ duyệt v = 0..255 với điều kiện chặt hist[v] > mode_freq, chương trình chọn mode_val = 10 (nhỏ nhất) → in \"3 10 2\"."
        },
        {
          "name": "Biên pixel 0 và 255",
          "caseDesc": "n = 5, T = 3, pixels = [0, 255, 255, 0, 255]",
          "howHandled": "Chỉ số mảng my_hist[0] và my_hist[255] đều hợp lệ trong kích thước 256 → distinct = 2, mode_val = 255, mode_freq = 3."
        },
        {
          "name": "Chỉ có 1 phần tử & T > n",
          "caseDesc": "n = 1, T = 8, pixels = [128]",
          "howHandled": "tid 0 đếm hist[128] = 1, tid 1..7 ghi toàn 0 → in \"1 128 1\"."
        },
        {
          "name": "Tất cả 10^6 pixel giống nhau",
          "caseDesc": "n = 1000000, T = 16, mọi pixel = 42",
          "howHandled": "Mỗi luồng đếm cục bộ không khóa mutex nên đạt tốc độ tối đa, tổng hợp ra distinct = 1, mode_val = 42, mode_freq = 1000000."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <stdlib.h>, <pthread.h> cùng int n, T, *pixels; và mảng 2 chiều long long local_hist[20][256];.",
        "Trong worker(): chia đoạn [start, end), tạo mảng cục bộ long long my_hist[256] = {0}; đếm my_hist[pixels[i]]++, rồi chép sang local_hist[tid][0..255].",
        "Trong main(): đọc n, T, malloc mảng pixels, nạp dữ liệu, chạy T luồng với ids[i] và gọi pthread_join().",
        "Pha Reduce: khởi tạo hist[256] = {0} và cộng dồn tất cả local_hist[t][v] vào hist[v].",
        "Duyệt v = 0..255 đếm distinct (hist[v] > 0) và cập nhật mode bằng dấu chặt (hist[v] > mode_freq), in 3 số rồi free(pixels)."
      ]
    }
  },
  {
    "num": 29,
    "id": "CR-29",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Trung bình",
    "title": "Tìm kiếm song song có dừng sớm (Early Stopping)",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join, pthread_mutex_t",
    "prompt": "Cho mảng gồm n số nguyên đôi một phân biệt, giá trị cần tìm target và số luồng T. Chia đều mảng cho T luồng tìm kiếm song song với cơ chế dừng sớm (early stopping): dùng cờ dùng chung found (khởi tạo 0) và found_idx (khởi tạo -1) được bảo vệ bằng pthread_mutex_t. Trong quá trình tìm kiếm, nếu luồng thấy a[i] == target thì khóa mutex đặt found = 1, found_idx = i rồi dừng; các luồng khác định kỳ kiểm tra biến found (đảm bảo an toàn bộ nhớ khi đọc/ghi đồng thời) và lập tức kết thúc sớm nếu found == 1. Sau pthread_join(), in found_idx (chỉ số 0-based) hoặc -1 nếu không tìm thấy.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create(), pthread_join() và cơ chế dừng sớm có đồng bộ mutex (hoặc atomic) khi cập nhật/kiểm tra found.",
      "Lưu ý vì các phần tử đôi một phân biệt, chỉ số found_idx (nếu có) là duy nhất."
    ],
    "inputSpec": "Dòng 1: ba số nguyên n target T. Dòng 2: n số nguyên đôi một phân biệt.",
    "outputSpec": "Chỉ số 0-based của target trong mảng, hoặc -1 nếu không tồn tại.",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= T <= 16",
      "-10^9 <= a_i, target <= 10^9"
    ],
    "example": {
      "note": "Phần tử 25 nằm ở chỉ số 2 (0-based).",
      "input": "6 25 3\n11 4 25 9 30 -7",
      "output": "2"
    },
    "relatedTopics": [
      {
        "id": "4-8",
        "label": "4.8 Data Race khi một luồng ghi và luồng khác đọc không đồng bộ"
      },
      {
        "id": "4-9",
        "label": "4.9 Kiểm tra định kỳ (Periodic Polling) giảm tranh chấp Mutex"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Nếu kiểm tra khóa mutex ở TỪNG phần tử (mỗi i đều lock/unlock) thì chi phí khóa sẽ nuốt mất lợi ích song song; còn nếu đọc biến found trần không khóa thì vi phạm C11 Data Race. Kiểm tra định kỳ mỗi lô 64 phần tử dưới khóa mutex vừa an toàn bộ nhớ tuyệt đối vừa giữ chi phí khóa gần bằng 0!",
    "relatedQuestions": [
      "CR-18",
      "CR-25"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint n, target, T;\nint *a;\nint found = 0;\nint found_idx = -1;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);\n\n    for (int i = start; i < end; i++) {\n        if ((i - start) % 256 == 0) {\n            pthread_mutex_lock(&mtx);\n            int stop = found;\n            pthread_mutex_unlock(&mtx);\n            if (stop) break;\n        }\n        if (a[i] == target) {\n            pthread_mutex_lock(&mtx);\n            found = 1;\n            found_idx = i;\n            pthread_mutex_unlock(&mtx);\n            break;\n        }\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d %d\", &n, &target, &T);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    printf(\"%d\\n\", found_idx);\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Kiểm tra cờ found dưới mutex mỗi 64 bước lặp (((i - start) & 63) == 0) giúp giảm 98.4% tranh chấp khóa mà vẫn dừng gần như tức thì khi một luồng khác tìm thấy đích."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "pthread_mutex_lock",
        "pthread_mutex_unlock"
      ],
      "forbiddenApis": [
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Thoát vòng lặp sớm bằng break / return khi đã tìm thấy target",
          "regex": "\\b(break|return)\\b",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 5 — Tìm kiếm song song có cơ chế dừng sớm (Parallel Search with Early Stopping · Lab 5 Bài 3).",
      "idea": {
        "summary": "Cho mảng n số nguyên đôi một phân biệt và giá trị target cần tìm bằng T luồng. Nếu để cả T luồng quét hết mảng ngay cả khi một luồng đã tìm thấy target ở đầu mảng thì rất lãng phí CPU. Giải pháp là dùng cờ dùng chung found (khởi tạo 0) và found_idx (khởi tạo -1) được bảo vệ bằng pthread_mutex_t; khi một luồng tìm thấy, nó bật cờ dừng để các luồng khác kiểm tra định kỳ (mỗi 256 phần tử) và thoát sớm.",
        "steps": [
          "Bước 1 — Khởi tạo trạng thái chung: Khai báo biến toàn cục found = 0, found_idx = -1 và khóa mutex tĩnh pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER.",
          "Bước 2 — Phân hoạch không gian tìm kiếm: Chia mảng a[0..n-1] thành T đoạn nửa mở [start, end) rời nhau cho T luồng tìm song song.",
          "Bước 3 — Kiểm tra cờ dừng sớm theo lô (Batch Polling): Cứ mỗi 256 phần tử ((i - start) % 256 == 0), luồng mới khóa mutex đọc found ra biến cục bộ stop, mở khóa ngay, rồi break nếu stop == 1.",
          "Bước 4 — Ghi nhận kết quả khi tìm thấy: Nếu gặp a[i] == target, luồng khóa mutex, cập nhật đồng thời found = 1 và found_idx = i, mở khóa mutex rồi lập tức break thoát vòng lặp.",
          "Bước 5 — Đồng bộ & xuất kết quả: Luồng chính gọi pthread_join() chờ mọi luồng dừng hẳn, in found_idx (là chỉ số 0-based duy nhất hoặc -1 nếu không thấy) và giải phóng mảng a."
        ],
        "whyThisWay": "Tại sao KHÔNG đọc trực tiếp if (found) break; không có mutex? Vì trong chuẩn C11/POSIX, việc một luồng ghi found = 1 trong khi luồng khác đọc found không đồng bộ là Data Race (Undefined Behavior): trình biên dịch -O2 có quyền giữ found trong thanh ghi mãi mãi khiến luồng khác không bao giờ dừng! Ngược lại, nếu khóa mutex ở MỌI phần tử i thì tranh chấp khóa sẽ làm chương trình chậm khủng khiếp. Kiểm tra định kỳ mỗi 256 bước cân bằng hoàn hảo: vừa an toàn bộ nhớ 100%, vừa giảm chi phí khóa mutex đi 256 lần.",
        "complexity": "Thời gian: O(n / T) trường hợp xấu nhất (không thấy), nhanh hơn nhiều khi tìm thấy sớm · Bộ nhớ: O(n) · Tài nguyên: T luồng POSIX, 1 pthread_mutex_t."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–9",
          "title": "Khai báo thư viện, cờ dừng sớm & khởi tạo Mutex tĩnh",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\nint n, target, T;\nint *a;\nint found = 0;\nint found_idx = -1;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;",
          "explain": "Biến found = 0 báo hiệu \"chưa tìm thấy\", found_idx = -1 là giá trị mặc định nếu target không xuất hiện trong mảng. Macro PTHREAD_MUTEX_INITIALIZER khởi tạo tĩnh khóa loại trừ tương hỗ mtx ngay khi chương trình bắt đầu (tương đương gọi pthread_mutex_init(&mtx, NULL) trong main). Khóa mtx bảo vệ đồng thời cả hai biến chia sẻ found và found_idx."
        },
        {
          "lines": "Dòng 11–16",
          "title": "Phân hoạch tĩnh đoạn tìm kiếm [start, end) cho từng luồng",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    int base = n / T, rem = n % T;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);",
          "explain": "Mỗi luồng phụ trách tìm kiếm trên một đoạn rời nhau [start, end) của mảng a. Việc phân chia không chồng lấn bảo đảm toàn bộ mảng đều được quét khi target không tồn tại, và không có hai luồng nào kiểm tra trùng một chỉ số."
        },
        {
          "lines": "Dòng 17–23",
          "title": "Kiểm tra cờ dừng sớm theo chu kỳ 256 phần tử (Batch Polling)",
          "code": "    for (int i = start; i < end; i++) {\n        if ((i - start) % 256 == 0) {\n            pthread_mutex_lock(&mtx);\n            int stop = found;\n            pthread_mutex_unlock(&mtx);\n            if (stop) break;\n        }",
          "explain": "Kỹ thuật tối ưu rất thông minh: thay vì khóa mutex ở mọi vòng lặp (tốn hàng trăm nghìn lần khóa/mở), luồng chỉ kiểm tra cờ found sau mỗi 256 phần tử đã duyệt ((i - start) % 256 == 0). CHÚ Ý KỸ THUẬT TRÁNH DEADLOCK: luồng sao chép giá trị found vào biến cục bộ int stop, GỌI pthread_mutex_unlock(&mtx) TRƯỚC, rồi mới thực hiện if (stop) break;! Nếu lỡ break trong lúc vẫn đang giữ khóa mtx, toàn bộ các luồng khác sẽ bị treo vĩnh viễn (deadlock)."
        },
        {
          "lines": "Dòng 24–33",
          "title": "Cập nhật found & found_idx an toàn khi tìm thấy target",
          "code": "        if (a[i] == target) {\n            pthread_mutex_lock(&mtx);\n            found = 1;\n            found_idx = i;\n            pthread_mutex_unlock(&mtx);\n            break;\n        }\n    }\n    return NULL;\n}",
          "explain": "Khi phát hiện a[i] == target, luồng lập tức khóa mtx, đặt cả hai biến found = 1 và found_idx = i bên trong vùng găng (critical section), mở khóa mtx rồi break để kết thúc ngay lập tức. Vì đề bài cho các phần tử đôi một phân biệt, tối đa chỉ có 1 luồng đi vào nhánh này và chỉ số found_idx là duy nhất."
        },
        {
          "lines": "Dòng 35–46",
          "title": "Đọc dữ liệu, sinh T luồng tìm kiếm & chờ đồng bộ",
          "code": "int main() {\n    scanf(\"%d %d %d\", &n, &target, &T);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);",
          "explain": "Đọc n, target, T và mảng a trên Heap. Sau đó tạo T luồng với mảng ids[i] riêng và gọi pthread_join() chờ tất cả các luồng kết thúc (dù dừng sớm hay quét hết đoạn) trước khi in kết quả."
        },
        {
          "lines": "Dòng 48–51",
          "title": "In chỉ số tìm được & giải phóng bộ nhớ Heap",
          "code": "    printf(\"%d\\n\", found_idx);\n    free(a);\n    return 0;\n}",
          "explain": "Sau vòng pthread_join(), không còn luồng nào chạy nữa nên việc đọc trực tiếp found_idx là hoàn toàn an toàn. Nếu không luồng nào tìm thấy target, found_idx vẫn giữ giá trị khởi tạo -1. Cuối cùng gọi free(a) giải phóng bộ nhớ và trả về 0."
        }
      ],
      "testCases": [
        {
          "name": "Tìm thấy ở đầu mảng (kích hoạt Early Stopping mạnh)",
          "caseDesc": "n = 100000, target = a[5], T = 8",
          "howHandled": "tid 0 tìm thấy ở chỉ số 5, đặt found = 1, found_idx = 5; các luồng 1..7 dừng ngay tại mốc kiểm tra % 256 kế tiếp → in \"5\"."
        },
        {
          "name": "Target nằm ở phần tử cuối cùng (n - 1)",
          "caseDesc": "n = 10, target = a[9], T = 4",
          "howHandled": "Luồng cuối tid = 3 duyệt tới chỉ số 9 khớp a[9] == target, cập nhật found_idx = 9 → in \"9\"."
        },
        {
          "name": "Không tồn tại target trong mảng (gồm cả số âm lớn)",
          "caseDesc": "n = 5, target = -1000000000, T = 4, a = [-5, 0, 10, 999999999, 7]",
          "howHandled": "Không luồng nào khớp, found_idx giữ nguyên -1 sau pthread_join() → in \"-1\"."
        },
        {
          "name": "T > n và mảng chỉ có 1 phần tử",
          "caseDesc": "n = 1, target = 42, T = 16, a = [42]",
          "howHandled": "tid 0 tìm thấy ở chỉ số 0; tid 1..15 có start == end nên thoát ngay mà không đụng mảng → in \"0\"."
        }
      ],
      "examRecipe": [
        "Khai báo biến toàn cục: int n, target, T, *a, found = 0, found_idx = -1; và pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;.",
        "Trong worker(): tính phân hoạch [start, end) như chuẩn tĩnh.",
        "Trong vòng for (i = start; i < end; i++), cứ mỗi (i - start) % 256 == 0 thì khóa mtx, chép int stop = found;, MỞ KHÓA mtx trước rồi mới if (stop) break;.",
        "Nếu a[i] == target thì khóa mtx, gán found = 1; found_idx = i;, mở khóa mtx rồi break;.",
        "Trong main(): đọc input, malloc mảng a, tạo T luồng bằng ids[i], pthread_join() hết rồi in found_idx và free(a)."
      ]
    }
  },
  {
    "num": 30,
    "id": "CR-30",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Trung bình",
    "title": "Nhân hai ma trận A x B song song theo dải hàng",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Cho ma trận A kích thước M x K, ma trận B kích thước K x N và số luồng T. Phân chia các hàng 0..M-1 của ma trận kết quả C = A * B thành tối đa min(M, T) dải liên tiếp để các luồng tính song song. Vì mỗi luồng chỉ ghi vào các hàng của riêng mình, chương trình không cần dùng mutex trong quá trình nhân (khuyến khích sắp xếp vòng lặp i-k-j để tăng hiệu quả bộ nhớ đệm cache). Sau pthread_join(), in toàn bộ ma trận C.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create() và pthread_join(); xử lý đúng khi M không chia hết cho T hoặc T > M.",
      "Tính phần tử C[i][j] bằng kiểu long long để tránh tràn số.",
      "Không in khoảng trắng dư ở cuối mỗi dòng."
    ],
    "inputSpec": "Dòng 1: bốn số nguyên M K N T. M dòng tiếp theo: ma trận A (M x K). K dòng tiếp theo: ma trận B (K x N).",
    "outputSpec": "M dòng, mỗi dòng N số nguyên (long long) là các hàng của ma trận tích C.",
    "constraints": [
      "1 <= M, K, N <= 100",
      "1 <= T <= 16",
      "-1000 <= A[i][j], B[i][j] <= 1000"
    ],
    "example": {
      "note": "Hàng 0: [1*7+2*9+3*11, 1*8+2*10+3*12] = [58, 64]; Hàng 1: [139, 154].",
      "input": "2 3 2 2\n1 2 3\n4 5 6\n7 8\n9 10\n11 12",
      "output": "58 64\n139 154"
    },
    "relatedTopics": [
      {
        "id": "6-1",
        "label": "6.1 Nhân Ma trận Song song (Data Parallelism)"
      },
      {
        "id": "6-5",
        "label": "6.5 Hoán đổi vòng lặp i-k-j tối ưu Spatial Locality trên Cache"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Thứ tự vòng lặp i - k - j cố định a_ik = A[i][k] trong thanh ghi rồi quét cả C[i][j] và B[k][j] theo hàng liên tiếp (stride = 1), giúp giảm mạnh tỷ lệ trượt Cache (Cache Miss) so với vòng lặp ngây thơ i - j - k.",
    "relatedQuestions": [
      "CR-27",
      "CR-32"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nint M, K, N, T;\nlong long A[105][105], B[105][105], C[105][105];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int nt = (T < M) ? T : M;\n    int base = M / nt, rem = M % nt;\n    int r_start = tid * base + (tid < rem ? tid : rem);\n    int r_end = r_start + base + (tid < rem ? 1 : 0);\n\n    for (int i = r_start; i < r_end; i++) {\n        for (int j = 0; j < N; j++) C[i][j] = 0;\n        for (int k = 0; k < K; k++) {\n            long long aik = A[i][k];\n            for (int j = 0; j < N; j++) {\n                C[i][j] += aik * B[k][j];\n            }\n        }\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d %d %d\", &M, &K, &N, &T);\n    for (int i = 0; i < M; i++)\n        for (int k = 0; k < K; k++) scanf(\"%lld\", &A[i][k]);\n    for (int k = 0; k < K; k++)\n        for (int j = 0; j < N; j++) scanf(\"%lld\", &B[k][j]);\n\n    int nt = (T < M) ? T : M;\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < nt; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);\n\n    for (int i = 0; i < M; i++) {\n        for (int j = 0; j < N; j++) {\n            printf(\"%lld%s\", C[i][j], (j == N - 1) ? \"\\n\" : \" \");\n        }\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Thứ tự vòng lặp i - k - j duyệt liên tiếp từng hàng của B và C (stride = 1), tối đa hóa tính cục bộ không gian trên L1 Cache.",
      "Mỗi luồng sở hữu độc quyền dải hàng [r_start, r_end) của C nên tuyệt đối không cần bất kỳ khóa đồng bộ nào."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "pthread_mutex_lock"
      ],
      "qualityRules": [
        {
          "desc": "Tính phần tử C[i][j] bằng kiểu long long",
          "regex": "long\\s+long",
          "flags": ""
        },
        {
          "desc": "Xử lý trường hợp T > M và phần dư M % w",
          "regex": "%|\\brem\\b",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 6 — Nhân hai ma trận song song theo dải hàng kết hợp kỹ thuật Hoán vị vòng lặp i-k-j (Loop Interchange · Mục 6.1, 6.5 · Lab 5 Bài 4).",
      "idea": {
        "summary": "Phép nhân hai ma trận A (M × K) và B (K × N) tạo ra ma trận C (M × N) trong đó mỗi hàng i của C chỉ phụ thuộc vào hàng i của A và toàn bộ ma trận B. Do đó, ta chia M hàng của C thành nt = min(T, M) dải hàng liên tiếp rời nhau giao cho nt luồng tính song song (hoàn toàn không cần mutex), đồng thời đổi thứ tự vòng lặp từ i-j-k sang i-k-j để truy cập bộ nhớ liên tiếp theo hàng, tăng vọt tỷ lệ trúng cache (cache hit).",
        "steps": [
          "Bước 1 — Nạp hai ma trận: Đọc kích thước M, K, N, số luồng T, sau đó đọc ma trận A (M × K) và B (K × N) vào mảng 2 chiều toàn cục kiểu long long.",
          "Bước 2 — Cắt số luồng thực tế nt = min(T, M): Nếu T > M, chỉ sinh đúng M luồng để tránh tạo các luồng thừa không có hàng nào để xử lý.",
          "Bước 3 — Phân hoạch theo dải hàng [r_start, r_end): Chia M hàng cho nt luồng bằng công thức chia phần dư cân bằng; mỗi luồng sở hữu độc quyền các hàng C[r_start .. r_end - 1].",
          "Bước 4 — Nhân ma trận với vòng lặp i-k-j thân thiện Cache: Với mỗi hàng i của mình, khởi tạo C[i][0..N-1] = 0; sau đó duyệt k = 0..K-1, lưu hằng số aik = A[i][k] vào thanh ghi, rồi quét j = 0..N-1 cập nhật C[i][j] += aik * B[k][j].",
          "Bước 5 — Đồng bộ & xuất ma trận: Gọi pthread_join() chờ nt luồng xong hết, sau đó in từng hàng của C với dấu cách giữa các phần tử và xuống dòng ngay sau phần tử cuối hàng."
        ],
        "whyThisWay": "Trong ngôn ngữ C, mảng 2 chiều được lưu theo thứ tự hàng (Row-Major Order): các phần tử B[k][0], B[k][1], B[k][2]... nằm sát nhau trong RAM. Thứ tự vòng lặp ngây thơ i-j-k truy cập B[k][j] nhảy dọc theo cột (bước nhảy cả trăm phần tử mỗi lần) gây hàng loạt lỗi trượt cache (cache miss). Hoán vị sang i-k-j giúp vòng trong cùng j quét liên tiếp cả B[k][j] lẫn C[i][j] với bước nhảy 1, tăng tốc gấp nhiều lần ngay cả trước khi song song hóa! Chia theo dải hàng còn giúp các luồng ghi vào vùng nhớ cách xa nhau, không cần mutex và không bị False Sharing.",
        "complexity": "Thời gian: O((M · K · N) / min(T, M)) · Bộ nhớ: O(M·K + K·N + M·N) (~265 KB tĩnh) · Tài nguyên: min(T, M) luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo thư viện & ba ma trận toàn cục kiểu long long",
          "code": "#include <stdio.h>\n#include <pthread.h>\nint M, K, N, T;\nlong long A[105][105], B[105][105], C[105][105];",
          "explain": "Khai báo tĩnh kích thước 105×105 (dư an toàn cho ràng buộc M, K, N <= 100) ở vùng toàn cục (phân đoạn BSS) để tránh làm tràn ngăn xếp Stack của hàm main và cho phép mọi luồng đọc/ghi trực tiếp. Kiểu long long (64-bit) đảm bảo tích cộng dồn C[i][j] không bao giờ bị tràn ngay cả khi mở rộng giới hạn giá trị phần tử."
        },
        {
          "lines": "Dòng 7–13",
          "title": "Giới hạn số luồng nt = min(T, M) & phân hoạch dải hàng",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    int nt = (T < M) ? T : M;\n    int base = M / nt, rem = M % nt;\n    int r_start = tid * base + (tid < rem ? tid : rem);\n    int r_end = r_start + base + (tid < rem ? 1 : 0);",
          "explain": "Toán tử ba ngôi nt = (T < M) ? T : M lấy giá trị nhỏ hơn giữa T và M để đảm bảo mỗi luồng được giao ít nhất 1 hàng trọn vẹn (không tạo luồng nhàn rỗi khi T > M). Công thức r_start và r_end chia M hàng thành nt dải liên tiếp rời nhau: luồng tid chỉ ghi vào các hàng i thuộc [r_start, r_end) của C, trong khi chỉ đọc A và B — hoàn toàn không có tranh chấp ghi (zero data race)."
        },
        {
          "lines": "Dòng 14–24",
          "title": "Khởi tạo hàng C & nhân ma trận theo thứ tự i-k-j tối ưu Cache",
          "code": "    for (int i = r_start; i < r_end; i++) {\n        for (int j = 0; j < N; j++) C[i][j] = 0;\n        for (int k = 0; k < K; k++) {\n            long long aik = A[i][k];\n            for (int j = 0; j < N; j++) {\n                C[i][j] += aik * B[k][j];\n            }\n        }\n    }\n    return NULL;\n}",
          "explain": "Với mỗi hàng i, bước C[i][j] = 0 đảm bảo phần tử đích luôn sạch trước khi cộng dồn (rất quan trọng nếu tái sử dụng ma trận). Sau đó vòng lặp k ở giữa và j ở trong cùng thực hiện kỹ thuật Loop Interchange: biến aik = A[i][k] được giữ cố định trong thanh ghi CPU suốt vòng j, còn vòng j quét tuần tự B[k][0..N-1] và C[i][0..N-1] sát nhau trong cùng các dòng cache 64-byte (spatial locality tối đa). Kết thúc dải hàng, luồng trả về NULL."
        },
        {
          "lines": "Dòng 26–32",
          "title": "Đọc kích thước M, K, N, T & hai ma trận đầu vào A, B",
          "code": "int main() {\n    scanf(\"%d %d %d %d\", &M, &K, &N, &T);\n    for (int i = 0; i < M; i++)\n        for (int k = 0; k < K; k++) scanf(\"%lld\", &A[i][k]);\n    for (int k = 0; k < K; k++)\n        for (int j = 0; j < N; j++) scanf(\"%lld\", &B[k][j]);",
          "explain": "Đọc đúng thứ tự kích thước: A có M hàng × K cột, B có K hàng × N cột. Dùng đặc tả %lld khớp chính xác với kiểu long long của các phần tử ma trận."
        },
        {
          "lines": "Dòng 33–40",
          "title": "Sinh đúng nt luồng worker & đồng bộ bằng pthread_join()",
          "code": "    int nt = (T < M) ? T : M;\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < nt; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);",
          "explain": "LƯU Ý ĐỒNG BỘ CÔNG THỨC: biến nt = (T < M) ? T : M trong main() phải trùng khớp tuyệt đối với biến nt trong worker() để phép chia M / nt không bị lệch chỉ số hàng! Tạo đủ nt luồng với mảng ids[i] riêng rồi gọi pthread_join() chờ cả nt luồng hoàn tất trước khi in ma trận C."
        },
        {
          "lines": "Dòng 42–48",
          "title": "In ma trận tích C chuẩn định dạng không khoảng trắng dư",
          "code": "    for (int i = 0; i < M; i++) {\n        for (int j = 0; j < N; j++) {\n            printf(\"%lld%s\", C[i][j], (j == N - 1) ? \"\\n\" : \" \");\n        }\n    }\n    return 0;\n}",
          "explain": "Biểu thức điều kiện (j == N - 1) ? \"\\n\" : \" \" là mẹo vàng khi thi chấm tự động: ở các cột j < N - 1 sẽ in kèm 1 dấu cách phân tách, còn đúng cột cuối cùng j == N - 1 sẽ in ký tự xuống dòng \\n thay vì dấu cách thừa, tránh tuyệt đối lỗi Presentation Error."
        }
      ],
      "testCases": [
        {
          "name": "Ma trận hình chữ nhật không vuông (M != K != N)",
          "caseDesc": "M = 2, K = 3, N = 4, T = 2",
          "howHandled": "Kiểm tra đúng chiều A[M][K] × B[K][N] → C[M][N] (2×4); không nhầm lẫn giữa M, K, N trong vòng lặp đọc, tính và in."
        },
        {
          "name": "Số luồng lớn hơn số hàng (T > M)",
          "caseDesc": "M = 1, K = 5, N = 3, T = 8 (nhân vector hàng với ma trận)",
          "howHandled": "nt = min(8, 1) = 1 → chỉ sinh 1 luồng xử lý trọn hàng 0, không tạo 7 luồng rỗng lãng phí."
        },
        {
          "name": "M không chia hết cho T",
          "caseDesc": "M = 7, K = 4, N = 5, T = 3",
          "howHandled": "nt = 3, base = 2, rem = 1 → tid 0 tính hàng [0, 3) (3 hàng), tid 1 tính [3, 5) (2 hàng), tid 2 tính [5, 7) (2 hàng)."
        },
        {
          "name": "Ma trận lớn tối đa có phần tử âm và dương",
          "caseDesc": "M = K = N = 100, T = 16, phần tử trong [-1000, 1000]",
          "howHandled": "Mỗi ô C[i][j] nằm trong [-10^8, 10^8], kiểu long long an toàn tuyệt đối và vòng lặp i-k-j hoàn thành trong vài mili giây."
        }
      ],
      "examRecipe": [
        "Khai báo toàn cục: int M, K, N, T; long long A[105][105], B[105][105], C[105][105];.",
        "Tính nt = (T < M) ? T : M; chia dải hàng [r_start, r_end) cho từng luồng theo base = M / nt, rem = M % nt.",
        "Trong worker(): với từng hàng i, gán C[i][j] = 0, rồi viết vòng lặp i-k-j (lưu aik = A[i][k], trong cùng C[i][j] += aik * B[k][j]).",
        "Trong main(): đọc M, K, N, T, đọc ma trận A (M×K) và B (K×N), tạo nt luồng với ids[i] rồi gọi pthread_join().",
        "In M dòng, mỗi dòng N phần tử C[i][j] với printf(\"%lld%s\", C[i][j], (j == N - 1) ? \"\\n\" : \" \");."
      ]
    }
  },
  {
    "num": 31,
    "id": "CR-31",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Khó",
    "title": "Sắp xếp nhanh song song (Parallel Quicksort) có ngưỡng và độ sâu",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Cho mảng gồm n số nguyên, ngưỡng kích thước đoạn threshold và giới hạn độ sâu sinh luồng max_depth. Cài đặt thuật toán Parallel Quicksort: sau bước phân hoạch (partition) tại mỗi mức đệ quy, nếu độ dài đoạn hiện tại > threshold VÀ depth < max_depth thì sinh luồng con bằng pthread_create() để sắp xếp song song nhánh con ở độ sâu (depth + 1), sau đó gọi pthread_join() chờ hoàn tất; ngược lại thực hiện Quicksort tuần tự trên đoạn đó. In mảng đã sắp xếp không giảm.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create() và pthread_join() theo cơ chế ngưỡng kích thước và độ sâu đệ quy.",
      "Nếu chọn qsort/quicksort tuần tự cho đoạn nhỏ, không gọi hàm qsort thư viện cho toàn mảng ở main mà bỏ qua cơ chế chia luồng.",
      "Không in khoảng trắng dư thừa cuối dòng."
    ],
    "inputSpec": "Dòng 1: ba số nguyên n threshold max_depth. Dòng 2: n số nguyên a_0, ..., a_{n-1}.",
    "outputSpec": "Một dòng gồm n số nguyên theo thứ tự không giảm, cách nhau 1 dấu cách.",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= threshold <= n",
      "0 <= max_depth <= 4",
      "-10^9 <= a_i <= 10^9"
    ],
    "example": {
      "note": "Mảng được phân hoạch và sắp xếp song song có kiểm soát số luồng theo threshold và max_depth.",
      "input": "8 2 2\n9 -3 5 1 8 5 -10 2",
      "output": "-10 -3 1 2 5 5 8 9"
    },
    "relatedTopics": [
      {
        "id": "6-6",
        "label": "6.6 Ý tưởng Parallel Quicksort & Ngưỡng cắt Nthresh"
      },
      {
        "id": "6-7",
        "label": "6.7 Quản lý tác vụ luồng con trong Parallel Quicksort"
      },
      {
        "id": "6-8",
        "label": "6.8 Đường cong hiệu năng chữ U khi chọn Ngưỡng tuần tự"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Tại mỗi nhánh song song, ta chỉ cần tạo 1 luồng con xử lý nửa trái còn luồng hiện tại tự xử lý nửa phải rồi mới pthread_join(tid, NULL)! Cách này giảm một nửa chi phí tạo luồng (tối đa 2^max_depth luồng đồng thời với max_depth <= 4 là <= 16 luồng) và cho phép đặt biến cấu trúc tham số ngay trên Stack an toàn.",
    "relatedQuestions": [
      "CR-30",
      "CR-32"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint *a;\nint threshold, max_depth;\n\ntypedef struct {\n    int left, right, depth;\n} SortTask;\n\nvoid swap_int(int *x, int *y) {\n    int tmp = *x; *x = *y; *y = tmp;\n}\n\nvoid seq_qsort(int l, int r) {\n    if (l >= r) return;\n    int pivot = a[(l + r) / 2];\n    int i = l, j = r;\n    while (i <= j) {\n        while (a[i] < pivot) i++;\n        while (a[j] > pivot) j--;\n        if (i <= j) {\n            swap_int(&a[i], &a[j]);\n            i++;\n            j--;\n        }\n    }\n    if (l < j) seq_qsort(l, j);\n    if (i < r) seq_qsort(i, r);\n}\n\nvoid *par_qsort(void *arg) {\n    SortTask *t = (SortTask *)arg;\n    int l = t->left, r = t->right, depth = t->depth;\n    if (l >= r) return NULL;\n\n    if (r - l + 1 <= threshold || depth >= max_depth) {\n        seq_qsort(l, r);\n        return NULL;\n    }\n\n    int pivot = a[(l + r) / 2];\n    int i = l, j = r;\n    while (i <= j) {\n        while (a[i] < pivot) i++;\n        while (a[j] > pivot) j--;\n        if (i <= j) {\n            swap_int(&a[i], &a[j]);\n            i++;\n            j--;\n        }\n    }\n\n    pthread_t left_th;\n    int spawned = 0;\n    SortTask left_task = { l, j, depth + 1 };\n    if (l < j) {\n        pthread_create(&left_th, NULL, par_qsort, &left_task);\n        spawned = 1;\n    }\n\n    SortTask right_task = { i, r, depth + 1 };\n    if (i < r) {\n        par_qsort(&right_task);\n    }\n\n    if (spawned) {\n        pthread_join(left_th, NULL);\n    }\n    return NULL;\n}\n\nint main() {\n    int n;\n    scanf(\"%d %d %d\", &n, &threshold, &max_depth);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    SortTask root = { 0, n - 1, 0 };\n    par_qsort(&root);\n\n    for (int i = 0; i < n; i++) {\n        printf(\"%d%s\", a[i], (i == n - 1) ? \"\\n\" : \" \");\n    }\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Phân hoạch hai con trỏ kiểu Hoare với chốt ở giữa đoạn a[l + (r - l) / 2] tránh suy biến O(n^2) khi mảng đã sắp sẵn hoặc có nhiều phần tử trùng nhau.",
      "Biến cục bộ left_task sống an toàn trên Stack của hàm hiện tại vì ta gọi pthread_join(tid, NULL) ngay trước khi hàm par_quicksort trở về."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra cả hai điều kiện ngưỡng kích thước threshold và độ sâu max_depth",
          "regex": "threshold[\\s\\S]*depth|depth[\\s\\S]*threshold",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 6 — Chia để trị song song: Parallel Quicksort có ngưỡng kích thước (threshold) và giới hạn độ sâu sinh luồng (max_depth) (Mục 6.6, 6.7, 6.8 · Lab 5 Bài 5).",
      "idea": {
        "summary": "Quicksort chia mảng [l, r] quanh một chốt (pivot) thành hai đoạn hoàn toàn rời nhau [l, j] và [i, r] rồi sắp xếp đệ quy hai nhánh độc lập. Để song song hóa hiệu quả bằng Pthreads mà không bị bùng nổ số luồng (thread explosion), ta dùng hai chốt chặn (cutoff): chỉ sinh luồng mới khi độ dài đoạn > threshold VÀ độ sâu đệ quy depth < max_depth; đặc biệt, luồng hiện tại chỉ sinh 1 luồng con cho nhánh trái rồi TỰ MÌNH xử lý nhánh phải trước khi pthread_join(), giúp giảm một nửa chi phí tạo luồng.",
        "steps": [
          "Bước 1 — Đóng gói tham số đệ quy: Định nghĩa struct SortTask { int left, right, depth; } để truyền cả 3 thông số qua duy nhất 1 con trỏ void *arg của pthread_create().",
          "Bước 2 — Kiểm tra điều kiện dừng & Cutoff: Trong par_qsort(), nếu l >= r thì thoát; nếu kích thước đoạn (r - l + 1 <= threshold) HOẶC đã chạm giới hạn độ sâu (depth >= max_depth) thì chuyển thẳng sang hàm tuần tự seq_qsort(l, r).",
          "Bước 3 — Phân hoạch hai con trỏ (Hoare-style): Chọn pivot ở giữa a[(l + r) / 2], đẩy các phần tử <= pivot sang trái và >= pivot sang phải để tách thành hai đoạn không giao nhau [l, j] và [i, r].",
          "Bước 4 — Song song hóa thông minh (Parent Reuse): Nếu nhánh trái có nhiều hơn 1 phần tử (l < j), sinh 1 luồng con left_th chạy par_qsort trên {l, j, depth + 1}; đồng thời luồng hiện tại tự gọi đệ quy par_qsort trên nhánh phải {i, r, depth + 1}.",
          "Bước 5 — Chờ đồng bộ & xuất mảng: Nếu đã sinh luồng con (spawned == 1), gọi pthread_join(left_th, NULL) trước khi hàm trả về (đảm bảo biến left_task trên Stack còn sống trọn đời luồng con); sau khi nút gốc hoàn tất, main() in mảng đã sắp xếp."
        ],
        "whyThisWay": "Sinh luồng ở hệ điều hành tốn hàng chục micro giây và chiếm bộ nhớ Stack riêng (~8 MB/luồng trên Linux). Nếu sinh luồng tới tận mảng dài 2 phần tử, chương trình sẽ tạo hàng chục nghìn luồng gây cạn tài nguyên (pthread_create thất bại) và chậm hơn sắp xếp tuần tự rất nhiều. Kết hợp threshold (cắt nhánh nhỏ) và max_depth (giới hạn tổng luồng tối đa <= 2^max_depth) cùng kỹ thuật tái sử dụng luồng cha cho nhánh phải là chuẩn mực vàng của Parallel Divide-and-Conquer.",
        "complexity": "Thời gian trung bình: O((n log n) / P + n) với P <= 2^max_depth · Bộ nhớ: O(n) + O(log n) stack đệ quy · Tài nguyên: tối đa 2^max_depth luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–10",
          "title": "Khai báo thư viện, biến toàn cục & struct gói tham số SortTask",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\nint *a;\nint threshold, max_depth;\ntypedef struct {\n    int left, right, depth;\n} SortTask;",
          "explain": "Mảng a cấp phát động trên Heap cùng hai tham số threshold, max_depth để toàn cục giúp mọi mức đệ quy truy cập dễ dàng. Vì hàm luồng POSIX chỉ nhận đúng 1 tham số void *arg, ta phải gom 3 giá trị (left, right, depth) vào cấu trúc SortTask để truyền vào pthread_create() và gọi đệ quy."
        },
        {
          "lines": "Dòng 12–14",
          "title": "Hàm tiện ích swap_int() hoán đổi hai phần tử qua con trỏ",
          "code": "void swap_int(int *x, int *y) {\n    int tmp = *x; *x = *y; *y = tmp;\n}",
          "explain": "Nhận địa chỉ hai phần tử (&a[i], &a[j]) và hoán đổi giá trị trực tiếp trong bộ nhớ mảng a. Tách thành hàm nhỏ giúp code phân hoạch ở cả bản tuần tự và song song gọn gàng, ít nhầm lẫn khi thi."
        },
        {
          "lines": "Dòng 16–31",
          "title": "Quicksort tuần tự seq_qsort() với chốt giữa & hai con trỏ",
          "code": "void seq_qsort(int l, int r) {\n    if (l >= r) return;\n    int pivot = a[(l + r) / 2];\n    int i = l, j = r;\n    while (i <= j) {\n        while (a[i] < pivot) i++;\n        while (a[j] > pivot) j--;\n        if (i <= j) { swap_int(&a[i], &a[j]); i++; j--; }\n    }\n    if (l < j) seq_qsort(l, j);\n    if (i < r) seq_qsort(i, r);\n}",
          "explain": "Đây là phiên bản Quicksort tuần tự chạy trên các đoạn nhỏ (không còn chi phí tạo luồng). Chọn pivot = a[(l + r) / 2] ở giữa giúp tránh kịch bản xấu nhất O(n^2) khi mảng đầu vào đã sắp xếp sẵn (tăng hoặc giảm). Lưu ý vòng lặp trong dùng dấu so sánh chặt (< và >) và luôn tăng i++, giảm j-- khi hoán đổi để không bao giờ bị lặp vô hạn kể cả khi mảng có nhiều phần tử trùng nhau."
        },
        {
          "lines": "Dòng 33–41",
          "title": "Hàm par_qsort(): Giải gói tham số & chốt chặn Cutoff",
          "code": "void *par_qsort(void *arg) {\n    SortTask *t = (SortTask *)arg;\n    int l = t->left, r = t->right, depth = t->depth;\n    if (l >= r) return NULL;\n    if (r - l + 1 <= threshold || depth >= max_depth) {\n        seq_qsort(l, r);\n        return NULL;\n    }",
          "explain": "Ép kiểu arg về SortTask* và sao chép l, r, depth ra biến cục bộ. Dòng 36 chặn đoạn rỗng hoặc 1 phần tử (l >= r). Dòng 38 thực hiện cơ chế Cutoff kép theo đúng đề bài: nếu độ dài đoạn (r - l + 1) <= threshold HOẶC độ sâu hiện tại đã đạt depth >= max_depth thì lập tức giao toàn bộ đoạn [l, r] cho seq_qsort(l, r) xử lý tuần tự rồi thoát, không sinh thêm luồng."
        },
        {
          "lines": "Dòng 43–53",
          "title": "Phân hoạch tại chỗ (In-place Partition) tách hai đoạn rời nhau",
          "code": "    int pivot = a[(l + r) / 2];\n    int i = l, j = r;\n    while (i <= j) {\n        while (a[i] < pivot) i++;\n        while (a[j] > pivot) j--;\n        if (i <= j) { swap_int(&a[i], &a[j]); i++; j--; }\n    }",
          "explain": "Sau khi vòng while (i <= j) kết thúc, ta chắc chắn j < i và mọi phần tử thuộc [l, j] đều <= pivot <= mọi phần tử thuộc [i, r]. Vì hai vùng nhớ a[l..j] và a[i..r] hoàn toàn KHÔNG giao nhau, hai luồng có thể sắp xếp đồng thời hai đoạn này mà không cần bất kỳ khóa mutex nào!"
        },
        {
          "lines": "Dòng 55–72",
          "title": "Sinh 1 luồng nhánh trái, tái sử dụng luồng cha cho nhánh phải & Join",
          "code": "    pthread_t left_th;\n    int spawned = 0;\n    SortTask left_task = { l, j, depth + 1 };\n    if (l < j) {\n        pthread_create(&left_th, NULL, par_qsort, &left_task);\n        spawned = 1;\n    }\n    SortTask right_task = { i, r, depth + 1 };\n    if (i < r) par_qsort(&right_task);\n    if (spawned) pthread_join(left_th, NULL);\n    return NULL;\n}",
          "explain": "CƠ CHẾ ĐỈNH CAO CẦN NẮM VỮNG: (1) Thay vì tạo 2 luồng rồi ngồi chờ không làm gì, luồng hiện tại chỉ tạo 1 luồng left_th xử lý [l, j] (ở độ sâu depth + 1) và tự mình xử lý [i, r] song song ngay sau đó — giảm một nửa số luồng tạo mới! (2) Cờ spawned = 1 rất quan trọng: chỉ gọi pthread_join(left_th, NULL) khi thực sự đã gọi pthread_create() (nếu l >= j mà gọi pthread_join trên biến left_th chưa khởi tạo sẽ gây crash!). (3) Việc truyền địa chỉ biến cục bộ &left_task trên Stack hoàn toàn an toàn vì pthread_join() chặn hàm hiện tại lại cho đến khi luồng con chạy xong hẳn rồi mới giải phóng khung Stack."
        },
        {
          "lines": "Dòng 74–88",
          "title": "Hàm main(): Nạp dữ liệu, kích hoạt nút gốc, in kết quả & free()",
          "code": "int main() {\n    int n;\n    scanf(\"%d %d %d\", &n, &threshold, &max_depth);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    SortTask root = { 0, n - 1, 0 };\n    par_qsort(&root);\n    for (int i = 0; i < n; i++) printf(\"%d%s\", a[i], (i == n - 1) ? \"\\n\" : \" \");\n    free(a);\n    return 0;\n}",
          "explain": "Đọc n, threshold, max_depth và mảng a trên Heap. Tạo tác vụ gốc root = { 0, n - 1, 0 } (toàn mảng ở độ sâu 0) rồi gọi trực tiếp par_qsort(&root) trên luồng chính. Khi par_qsort(&root) trả về, mọi luồng con ở mọi tầng đều đã được join đầy đủ và mảng a đã sắp xếp không giảm hoàn chỉnh. In kết quả không dấu cách thừa cuối dòng rồi giải phóng a."
        }
      ],
      "testCases": [
        {
          "name": "Chế độ hoàn toàn tuần tự (max_depth = 0)",
          "caseDesc": "n = 10, threshold = 2, max_depth = 0",
          "howHandled": "Ngay tại root (depth = 0 >= max_depth = 0), điều kiện Cutoff kích hoạt gọi thẳng seq_qsort(0, 9), sinh 0 luồng phụ và sắp xếp chính xác."
        },
        {
          "name": "Mảng toàn phần tử trùng nhau hoặc đã sắp xếp ngược",
          "caseDesc": "n = 1000, threshold = 64, max_depth = 3, mảng gồm toàn số 5 hoặc giảm dần",
          "howHandled": "Chốt giữa a[(l+r)/2] và phân hoạch hai con trỏ luôn đẩy i++, j-- giúp phân hoạch cân bằng, không rơi vào O(n^2) hay lặp vô hạn."
        },
        {
          "name": "Biên nhỏ nhất (n = 1) và số âm lớn ±10^9",
          "caseDesc": "n = 1, threshold = 1, max_depth = 4, a = [-1000000000]",
          "howHandled": "Điều kiện l >= r thoát ngay tại nút gốc, không sinh luồng và in \"-1000000000\"."
        },
        {
          "name": "Mảng lớn 10^5 phần tử với độ sâu tối đa max_depth = 4",
          "caseDesc": "n = 100000, threshold = 2000, max_depth = 4",
          "howHandled": "Tối đa 2^4 = 16 nhánh chạy song song đồng thời trên nhiều nhân CPU, các đoạn <= 2000 chuyển về seq_qsort nhanh gọn và kết thúc an toàn."
        }
      ],
      "examRecipe": [
        "Định nghĩa struct SortTask { int left, right, depth; }; cùng biến toàn cục int *a, threshold, max_depth;.",
        "Viết hàm swap_int() và seq_qsort(l, r) theo kiểu hai con trỏ với chốt giữa a[(l + r) / 2].",
        "Viết par_qsort(void *arg): nếu l >= r thì return NULL; nếu (r - l + 1 <= threshold || depth >= max_depth) thì gọi seq_qsort(l, r) và return NULL;.",
        "Phân hoạch [l, r] thành [l, j] và [i, r]; nếu l < j thì sinh luồng left_th (nhớ bật cờ spawned = 1); tự gọi par_qsort cho [i, r] nếu i < r; sau đó if (spawned) pthread_join(left_th, NULL);.",
        "Trong main(): đọc input, malloc a, gọi par_qsort(&root) với {0, n - 1, 0}, in mảng không dấu cách thừa rồi free(a)."
      ]
    }
  },
  {
    "num": 32,
    "id": "CR-32",
    "part": "Song song",
    "partLabel": "Phần 4 · Lập trình Song song (Parallel Programming)",
    "difficulty": "Khó",
    "title": "Nhân ma trận vuông song song kết hợp Cache Blocking (Tiling)",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Cho hai ma trận vuông A, B kích thước N x N, kích thước khối cache B_tile và số luồng T. Cài đặt phép nhân ma trận C = A * B song song bằng cách phân chia các hàng của C cho T luồng; bên trong mỗi luồng, thực hiện tính toán theo kỹ thuật Cache Blocking (tiling) chia chiều k và j thành từng khối kích thước B_tile x B_tile (xử lý phần dư khi N không chia hết cho B_tile). Sau pthread_join(), để đầu ra gọn gàng, in tổng các phần tử trên mỗi hàng của ma trận C.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create() và pthread_join() kết hợp vòng lặp phân khối (tiling) theo B_tile.",
      "Xử lý chính xác trường hợp N không chia hết cho B_tile hoặc N không chia hết cho T.",
      "Tính toán bằng kiểu long long; không in khoảng trắng thừa cuối dòng."
    ],
    "inputSpec": "Dòng 1: ba số nguyên N B_tile T. N dòng tiếp theo: ma trận A (N x N). N dòng tiếp theo: ma trận B (N x N).",
    "outputSpec": "Một dòng gồm N số nguyên (long long), phần tử thứ i là tổng các phần tử thuộc hàng i của C.",
    "constraints": [
      "1 <= N <= 200",
      "1 <= B_tile <= N",
      "1 <= T <= 16",
      "-100 <= A[i][j], B[i][j] <= 100"
    ],
    "example": {
      "note": "Ma trận tích C có các hàng [1, 7, 3] (tổng 11), [6, 6, 1] (tổng 13), [4, 4, 5] (tổng 13).",
      "input": "3 2 2\n1 2 0\n0 1 3\n2 1 1\n1 0 2\n0 3 1\n2 1 0",
      "output": "11 13 13"
    },
    "relatedTopics": [
      {
        "id": "6-3",
        "label": "6.3 Phân cấp Bộ nhớ & Bệnh Cache Inefficiency"
      },
      {
        "id": "6-4",
        "label": "6.4 Kỹ thuật Cache Blocking (Tiling) tối đa hóa Data Reuse"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Chia chiều kk và jj theo bước nhảy += B_tile kèm cận trên k_lim = min(kk + B_tile, N) và j_lim = min(jj + B_tile, N) giúp toàn bộ khối con của B và C nằm gọn trong L1 Cache suốt dải hàng của luồng mà vẫn đúng 100% khi N lẻ.",
    "relatedQuestions": [
      "CR-30"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nint N, B_tile, T;\nlong long A[205][205], B[205][205], C[205][205];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int nt = (T < N) ? T : N;\n    int base = N / nt, rem = N % nt;\n    int r_start = tid * base + (tid < rem ? tid : rem);\n    int r_end = r_start + base + (tid < rem ? 1 : 0);\n\n    for (int i = r_start; i < r_end; i++)\n        for (int j = 0; j < N; j++) C[i][j] = 0;\n\n    for (int ii = r_start; ii < r_end; ii += B_tile) {\n        for (int kk = 0; kk < N; kk += B_tile) {\n            for (int jj = 0; jj < N; jj += B_tile) {\n                for (int i = ii; i < ii + B_tile && i < r_end; i++) {\n                    for (int k = kk; k < kk + B_tile && k < N; k++) {\n                        long long aik = A[i][k];\n                        for (int j = jj; j < jj + B_tile && j < N; j++) {\n                            C[i][j] += aik * B[k][j];\n                        }\n                    }\n                }\n            }\n        }\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d %d\", &N, &B_tile, &T);\n    for (int i = 0; i < N; i++)\n        for (int j = 0; j < N; j++) scanf(\"%lld\", &A[i][j]);\n    for (int i = 0; i < N; i++)\n        for (int j = 0; j < N; j++) scanf(\"%lld\", &B[i][j]);\n\n    int nt = (T < N) ? T : N;\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < nt; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);\n\n    for (int i = 0; i < N; i++) {\n        long long row_sum = 0;\n        for (int j = 0; j < N; j++) row_sum += C[i][j];\n        printf(\"%lld%s\", row_sum, (i == N - 1) ? \"\\n\" : \" \");\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Khởi tạo C[i][j] = 0 trước vòng lặp phân khối và dùng toán tử cộng dồn += trong vòng trong cùng (tuyệt đối không gán = vì mỗi ô C[i][j] được tích lũy qua nhiều lát cắt kk!).",
      "Cận k_lim = min(kk + B_tile, N) và j_lim = min(jj + B_tile, N) xử lý hoàn hảo các khối biên khi N không chia hết cho B_tile."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join"
      ],
      "forbiddenApis": [
        "pthread_mutex_lock"
      ],
      "qualityRules": [
        {
          "desc": "Vòng lặp phân khối bước nhảy += B_tile",
          "regex": "\\+=\\s*B_tile",
          "flags": ""
        },
        {
          "desc": "Cộng dồn tích lũy += cho phần tử ma trận C",
          "regex": "\\+=",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 6 — Nhân ma trận vuông song song kết hợp kỹ thuật Cache Blocking / Tiling giảm Cache Miss (Mục 6.4 · Slide APT06 Slide 9).",
      "idea": {
        "summary": "Khi nhân hai ma trận vuông lớn C = A × B, ngay cả với thứ tự i-k-j, nếu một hàng của B và C vượt quá dung lượng L1 Cache, dữ liệu vừa nạp đã bị đẩy ra trước khi kịp tái sử dụng ở các hàng tiếp theo. Kỹ thuật Cache Blocking (Tiling) chia ma trận thành các khối vuông nhỏ kích thước B_tile × B_tile nằm vừa khít trong L1 Cache để tận dụng tối đa tính cục bộ thời gian (temporal locality), kết hợp chia các dải hàng của C cho nt = min(T, N) luồng tính song song không cần mutex.",
        "steps": [
          "Bước 1 — Đọc ma trận vuông: Đọc N, kích thước khối B_tile, số luồng T cùng hai ma trận vuông A, B (N × N) kiểu long long.",
          "Bước 2 — Phân hoạch hàng cho nt = min(T, N) luồng: Chia đều N hàng của ma trận tích C thành nt dải hàng [r_start, r_end) rời nhau và khởi tạo C[i][j] = 0 trên phần hàng của từng luồng.",
          "Bước 3 — Ba vòng lặp ngoài phân khối (Tiling): Quét tọa độ góc trên-trái của từng khối (ii, kk, jj) với bước nhảy += B_tile (ii chạy trong [r_start, r_end), còn kk, jj chạy trong [0, N)).",
          "Bước 4 — Ba vòng lặp trong nhân từng khối con theo i-k-j: Với mỗi khối, chạy i, k, j bên trong kích thước B_tile nhưng BẮT BUỘC chặn biên (i < r_end, k < N, j < N) để xử lý chính xác các khối biên khi N không chia hết cho B_tile.",
          "Bước 5 — Đồng bộ & in tổng từng hàng: Sau pthread_join(), luồng chính cộng tổng các phần tử trên từng hàng i của C và in N tổng hàng trên 1 dòng không có dấu cách thừa."
        ],
        "whyThisWay": "Mỗi phần tử trong khối A_tile và B_tile kích thước B_tile × B_tile được đọc từ RAM vào L1 Cache một lần nhưng được tái sử dụng tới B_tile lần trong các phép nhân cộng bên trong khối trước khi bị đẩy khỏi Cache — giúp giảm số lần Cache Miss đi xấp xỉ B_tile lần! Đồng thời, giữ thứ tự i-k-j ở 3 vòng lặp bên trong kết hợp lưu aik = A[i][k] vào thanh ghi đảm bảo vừa có tính cục bộ thời gian (nhờ Tiling) vừa có tính cục bộ không gian (truy cập liên tiếp theo hàng).",
        "complexity": "Thời gian: O(N^3 / min(T, N)) với số Cache Miss giảm O(B_tile) lần · Bộ nhớ: O(N^2) (~1 MB tĩnh cho 3 ma trận 205×205) · Tài nguyên: min(T, N) luồng POSIX, 0 mutex."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo thư viện & ba ma trận vuông toàn cục A, B, C",
          "code": "#include <stdio.h>\n#include <pthread.h>\nint N, B_tile, T;\nlong long A[205][205], B[205][205], C[205][205];",
          "explain": "Khai báo tĩnh kích thước 205×205 (dư an toàn cho ràng buộc N <= 200) trên vùng toàn cục để chia sẻ giữa các luồng mà không làm tràn Stack. Dùng kiểu long long vì mỗi phần tử C[i][j] có thể đạt tới ±200 × 100 × 100 = ±2×10^6 và tổng một hàng đạt tới ±4×10^8 (rất gần giới hạn int nếu dữ liệu mở rộng hơn)."
        },
        {
          "lines": "Dòng 7–15",
          "title": "Phân hoạch dải hàng cho nt = min(T, N) luồng & khởi tạo C = 0",
          "code": "void *worker(void *arg) {\n    int tid = *(int *)arg;\n    int nt = (T < N) ? T : N;\n    int base = N / nt, rem = N % nt;\n    int r_start = tid * base + (tid < rem ? tid : rem);\n    int r_end = r_start + base + (tid < rem ? 1 : 0);\n    for (int i = r_start; i < r_end; i++)\n        for (int j = 0; j < N; j++) C[i][j] = 0;",
          "explain": "Giới hạn số luồng thực tế nt = min(T, N) tránh tạo luồng rỗng khi T > N. Mỗi luồng nhận dải hàng [r_start, r_end) độc quyền trên C nên có thể tự khởi tạo C[i][j] = 0 song song mà không tranh chấp với luồng nào khác. Khởi tạo bằng 0 trước khi vào vòng Tiling là bắt buộc vì mỗi khối (kk) sẽ cộng dồn kết quả vào cùng ô C[i][j]."
        },
        {
          "lines": "Dòng 17–19",
          "title": "Ba vòng lặp ngoài phân khối Cache Blocking (ii, kk, jj)",
          "code": "    for (int ii = r_start; ii < r_end; ii += B_tile) {\n        for (int kk = 0; kk < N; kk += B_tile) {\n            for (int jj = 0; jj < N; jj += B_tile) {",
          "explain": "Đây là khung xương của kỹ thuật Cache Blocking (Tiling): thay vì nhảy 1 đơn vị, 3 chỉ số ii, kk, jj nhảy theo bước += B_tile để chọn ra một khối con kích thước tối đa B_tile × B_tile của C[ii..][jj..], A[ii..][kk..] và B[kk..][jj..]. Lưu ý ii bắt đầu từ r_start và dừng trước r_end để luồng chỉ xử lý đúng dải hàng được giao."
        },
        {
          "lines": "Dòng 20–32",
          "title": "Ba vòng lặp trong i-k-j kèm điều kiện chặn biên phần dư",
          "code": "                for (int i = ii; i < ii + B_tile && i < r_end; i++) {\n                    for (int k = kk; k < kk + B_tile && k < N; k++) {\n                        long long aik = A[i][k];\n                        for (int j = jj; j < jj + B_tile && j < N; j++) {\n                            C[i][j] += aik * B[k][j];\n                        }\n                    }\n                }\n            }\n        }\n    }\n    return NULL;\n}",
          "explain": "CHÚ Ý ĐIỀU KIỆN CHẶN BIÊN CỰC KỲ QUAN TRỌNG: khi N hoặc độ cao dải (r_end - r_start) KHÔNG chia hết cho B_tile, khối cuối cùng sẽ nhỏ hơn B_tile. Nhờ các điều kiện kép (i < ii + B_tile && i < r_end), (k < kk + B_tile && k < N) và (j < jj + B_tile && j < N), vòng lặp tự động cắt gọn ở đúng biên hợp lệ — nếu thiếu && i < r_end, luồng này sẽ ghi đè sang hàng của luồng kế tiếp gây sai kết quả! Bên trong khối vẫn giữ thứ tự i-k-j và lưu aik = A[i][k] trên thanh ghi để tối đa hóa hiệu năng."
        },
        {
          "lines": "Dòng 34–40",
          "title": "Nhập tham số N, B_tile, T & hai ma trận vuông A, B",
          "code": "int main() {\n    scanf(\"%d %d %d\", &N, &B_tile, &T);\n    for (int i = 0; i < N; i++)\n        for (int j = 0; j < N; j++) scanf(\"%lld\", &A[i][j]);\n    for (int i = 0; i < N; i++)\n        for (int j = 0; j < N; j++) scanf(\"%lld\", &B[i][j]);",
          "explain": "Đọc kích thước N, kích thước khối cache B_tile, số luồng T, sau đó nạp toàn bộ N×N phần tử của A và N×N phần tử của B bằng đặc tả %lld."
        },
        {
          "lines": "Dòng 41–48",
          "title": "Sinh nt = min(T, N) luồng & chờ đồng bộ bằng pthread_join()",
          "code": "    int nt = (T < N) ? T : N;\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < nt; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);",
          "explain": "Tạo đúng nt luồng (khớp công thức nt trong worker()) với mảng chỉ số ids[i] riêng biệt để tránh race condition. Vòng pthread_join() bảo đảm toàn bộ ma trận C đã được tính hoàn chỉnh trước khi luồng chính tính tổng hàng."
        },
        {
          "lines": "Dòng 50–56",
          "title": "Tính tổng từng hàng của C & in gọn trên 1 dòng",
          "code": "    for (int i = 0; i < N; i++) {\n        long long row_sum = 0;\n        for (int j = 0; j < N; j++) row_sum += C[i][j];\n        printf(\"%lld%s\", row_sum, (i == N - 1) ? \"\\n\" : \" \");\n    }\n    return 0;\n}",
          "explain": "Để đầu ra ngắn gọn thay vì in cả 40.000 số khi N = 200, đề bài yêu cầu in tổng các phần tử trên mỗi hàng i của ma trận C. Luồng chính cộng dồn C[i][0..N-1] vào row_sum (kiểu long long) và dùng toán tử ba ngôi (i == N - 1) ? \"\\n\" : \" \" in đúng N số cách nhau 1 dấu cách, kết thúc bằng xuống dòng không có khoảng trắng dư."
        }
      ],
      "testCases": [
        {
          "name": "N không chia hết cho cả B_tile và T",
          "caseDesc": "N = 5, B_tile = 2, T = 3",
          "howHandled": "Các khối biên kích thước 1×1, 1×2, 2×1 đều bị chặn đúng bởi && i < r_end, && k < N, && j < N; không ghi tràn sang hàng của luồng khác."
        },
        {
          "name": "Kích thước khối bằng đúng 1 hoặc bằng N (B_tile = 1 hoặc B_tile = N)",
          "caseDesc": "N = 4, B_tile = 1, T = 2 và N = 4, B_tile = 4, T = 2",
          "howHandled": "Khi B_tile = 1 mỗi khối có 1 phần tử; khi B_tile = N toàn bộ dải hàng nằm trong 1 khối duy nhất — cả hai đều cho kết quả y hệt phép nhân chuẩn."
        },
        {
          "name": "Biên nhỏ nhất & T > N",
          "caseDesc": "N = 1, B_tile = 1, T = 8, A = [[-7]], B = [[9]]",
          "howHandled": "nt = min(8, 1) = 1 → tính C[0][0] = -63 và in \"-63\"."
        },
        {
          "name": "Quy mô lớn nhất kiểm tra tốc độ Cache Blocking & chống tràn",
          "caseDesc": "N = 200, B_tile = 32, T = 8, phần tử trong [-100, 100]",
          "howHandled": "Mỗi khối 32×32 phần tử long long chiếm 8 KB (3 khối = 24 KB vừa khít L1 Cache 32 KB); tổng hàng tối đa 4×10^8 an toàn tuyệt đối trong long long."
        }
      ],
      "examRecipe": [
        "Khai báo toàn cục: int N, B_tile, T; long long A[205][205], B[205][205], C[205][205];.",
        "Trong worker(): tính nt = (T < N) ? T : N; chia dải hàng [r_start, r_end) và gán C[i][j] = 0 trên các hàng của mình.",
        "Viết 3 vòng lặp khối ngoài: ii từ r_start đến r_end, kk và jj từ 0 đến N, đều bước nhảy += B_tile.",
        "Viết 3 vòng lặp con i-k-j bên trong kèm chặn biên kép (&& i < r_end, && k < N, && j < N), lưu aik = A[i][k] và cộng dồn C[i][j] += aik * B[k][j].",
        "Trong main(): đọc N, B_tile, T và A, B; tạo nt luồng với ids[i], pthread_join() hết, rồi tính row_sum cho mỗi hàng i và in trên 1 dòng không dấu cách thừa."
      ]
    }
  }
];
