export const PART3_THREAD_QUESTIONS = [
  {
    "num": 17,
    "id": "CR-17",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Dễ",
    "title": "Tính tổng mảng trong luồng con và nhận kết quả qua pthread_join()",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create và pthread_join",
    "prompt": "Cho mảng gồm n số nguyên. Luồng chính đọc dữ liệu rồi tạo một luồng con bằng pthread_create() để tính tổng các phần tử trong mảng. Luồng con cấp phát động một vùng nhớ kiểu long long*, lưu kết quả tổng vào đó và trả con trỏ về cho luồng chính (qua return hoặc pthread_exit). Luồng chính nhận con trỏ kết quả thông qua tham số thứ hai của pthread_join(), in giá trị kết quả ra stdout và gọi free() giải phóng bộ nhớ.",
    "requirements": [
      "Sử dụng <pthread.h> và <stdlib.h>.",
      "Bắt buộc dùng pthread_create() và nhận giá trị trả về trực tiếp từ tham số void** của pthread_join() (không trả qua biến toàn cục).",
      "Giải phóng vùng nhớ kết quả bằng free() sau khi đọc xong giá trị."
    ],
    "inputSpec": "Dòng 1: số nguyên n. Dòng 2: n số nguyên a_0, a_1, ..., a_{n-1}.",
    "outputSpec": "Một số nguyên (long long) là tổng các phần tử trong mảng.",
    "constraints": [
      "1 <= n <= 10^5",
      "-10^6 <= a_i <= 10^6"
    ],
    "example": {
      "note": "3 + (-2) + 10 + 7 + 4 = 22.",
      "input": "5\n3 -2 10 7 4",
      "output": "22"
    },
    "relatedTopics": [
      {
        "id": "4-3",
        "label": "4.3 Tạo luồng với pthread_create() & truyền tham số"
      },
      {
        "id": "4-5",
        "label": "4.5 Nhận giá trị trả về qua void **retval của pthread_join()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Tuyệt đối không trả về địa chỉ của một biến cục bộ nằm trên Stack của luồng con (&local_sum), vì Stack của luồng con bị thu hồi ngay khi luồng kết thúc! Cấp phát trên Heap bằng malloc(sizeof(long long)) giúp vùng nhớ tồn tại an toàn cho tới khi luồng chính đọc xong và free().",
    "relatedQuestions": [
      "CR-19",
      "CR-26"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint n;\nint *a;\n\nvoid *sum_worker(void *arg) {\n    (void)arg;\n    long long *res = (long long *)malloc(sizeof(long long));\n    *res = 0;\n    for (int i = 0; i < n; i++) {\n        *res += a[i];\n    }\n    return res;\n}\n\nint main() {\n    scanf(\"%d\", &n);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    pthread_t tid;\n    pthread_create(&tid, NULL, sum_worker, NULL);\n\n    void *ret;\n    pthread_join(tid, &ret);\n\n    long long ans = *(long long *)ret;\n    printf(\"%lld\\n\", ans);\n\n    free(ret);\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Đóng gói con trỏ mảng arr và kích thước n vào cấu trúc SumArg gọn gàng mà không cần bất kỳ biến toàn cục nào.",
      "Luồng con cấp phát động long long *res trên Heap, luồng chính truyền &ret vào tham số thứ 2 của pthread_join() rồi free(ret) chống rò rỉ bộ nhớ."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h",
        "stdlib.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "malloc",
        "free"
      ],
      "forbiddenApis": [
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Nhận con trỏ trả về qua tham số thứ 2 khác NULL của pthread_join()",
          "regex": "pthread_join\\s*\\([^,]+,\\s*&\\s*\\w+\\s*\\)",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Trả về địa chỉ biến cục bộ trên stack (&sum) gây lỗi truy cập vùng nhớ đã giải phóng (dangling pointer)!",
          "regex": "return\\s*\\(\\s*void\\s*\\*\\s*\\)\\s*&\\s*\\w+|return\\s*&\\s*\\w+",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 4 — Tạo luồng với pthread_create() và trả kết quả cấp phát động qua tham số void **retval của pthread_join() (Mục 4.3, 4.5 · Lab 4 Bài 2).",
      "idea": {
        "summary": "Bài toán yêu cầu luồng chính (main thread) đọc một mảng gồm n số nguyên, sau đó tạo ra một luồng con (worker thread) để tính tổng toàn bộ mảng. Thay vì lưu kết quả vào biến toàn cục, luồng con phải tự cấp phát một ô nhớ trên vùng nhớ Heap bằng malloc(), ghi tổng vào đó rồi trả địa chỉ ô nhớ đó về cho luồng chính. Luồng chính gọi pthread_join() để vừa chờ luồng con chạy xong vừa nhận lại con trỏ địa chỉ này, đọc ra con số kết quả, in lên màn hình và giải phóng bộ nhớ bằng free().",
        "steps": [
          "Bước 1 — Đọc đầu vào ở luồng chính: Đọc số lượng phần tử n, cấp phát động mảng a gồm n phần tử kiểu int trên Heap bằng malloc() và đọc đủ n giá trị vào mảng.",
          "Bước 2 — Khởi chạy luồng con: Khai báo định danh luồng pthread_t tid và gọi pthread_create(&tid, NULL, sum_worker, NULL) để hệ điều hành bắt đầu chạy hàm sum_worker song song.",
          "Bước 3 — Tính tổng và cấp phát kết quả trên Heap: Trong sum_worker, gọi malloc(sizeof(long long)) để xin 8 byte trên Heap, gán *res = 0 rồi cộng dồn tất cả a[i] vào *res (dùng long long để chống tràn số).",
          "Bước 4 — Trả con trỏ và đồng bộ nhận kết quả: Luồng con return res; (kiểu void *). Luồng chính khai báo void *ret; rồi gọi pthread_join(tid, &ret); để chặn chờ luồng con kết thúc và nhận đúng địa chỉ res vào biến ret.",
          "Bước 5 — Giải tham chiếu, in và dọn dẹp bộ nhớ: Ép kiểu ret về (long long *), lấy giá trị *(long long *)ret để in với %lld, sau đó gọi free(ret) và free(a) nhằm tránh rò rỉ bộ nhớ (memory leak)."
        ],
        "whyThisWay": "Mỗi luồng trong POSIX Threads đều có vùng nhớ Stack riêng và Stack đó bị thu hồi ngay khi luồng kết thúc. Nếu luồng con khai báo biến cục bộ long long sum = 0; rồi return &sum;, luồng chính sẽ nhận một con trỏ treo (dangling pointer) trỏ vào vùng nhớ rác — gây lỗi nghiêm trọng (Undefined Behavior). Cấp phát kết quả trên Heap bằng malloc() đảm bảo vùng nhớ sống sót sau khi luồng con kết thúc cho tới khi luồng chính chủ động gọi free().",
        "complexity": "Thời gian: O(n) · Bộ nhớ: O(n) (mảng a kích thước 4n byte + 8 byte biến kết quả trên Heap) · Tài nguyên hệ thống: 1 luồng con POSIX (pthread_t)"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện chuẩn và POSIX Threads",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>",
          "explain": "<stdio.h> cung cấp scanf/printf để nhập xuất; <stdlib.h> cung cấp malloc và free để cấp phát/giải phóng bộ nhớ trên Heap; <pthread.h> chứa kiểu pthread_t cùng hai hàm cốt lõi pthread_create và pthread_join. Khi biên dịch bằng gcc, bắt buộc thêm cờ -pthread để trình liên kết (linker) gắn thư viện luồng của Linux."
        },
        {
          "lines": "Dòng 5–6",
          "title": "Khai báo biến toàn cục chia sẻ dữ liệu đầu vào",
          "code": "int n;\nint *a;",
          "explain": "Các luồng trong cùng một tiến trình dùng chung không gian địa chỉ (Global và Heap). Đặt n và con trỏ mảng a ở phạm vi toàn cục giúp hàm luồng sum_worker đọc trực tiếp dữ liệu mảng sau khi main đã đọc xong. Lưu ý: bài này chỉ đọc (read-only) n và a trong luồng con và main không sửa chúng khi luồng con đang chạy, nên hoàn toàn không xảy ra race condition."
        },
        {
          "lines": "Dòng 8–16",
          "title": "Hàm luồng con sum_worker() tính tổng và trả con trỏ Heap",
          "code": "void *sum_worker(void *arg) {\n    (void)arg;\n    long long *res = (long long *)malloc(sizeof(long long));\n    *res = 0;\n    for (int i = 0; i < n; i++) *res += a[i];\n    return res;\n}",
          "explain": "Mọi hàm luồng POSIX bắt buộc có đúng chữ ký void *ten_ham(void *arg). Dòng (void)arg; nhằm báo với trình biên dịch rằng ta cố ý không dùng tham số arg (tránh cảnh báo -Wunused-parameter khi chấm với -Wall -Wextra). Tiếp theo, malloc(sizeof(long long)) xin 8 byte trên Heap và trả về con trỏ long long *res; bắt buộc gán *res = 0; vì vùng nhớ malloc ban đầu chứa giá trị rác! Vòng lặp cộng dồn a[i] vào *res kiểu long long (chịu được ±9×10^18, tránh tràn int 32-bit khi tổng lên tới ±10^11). Cuối cùng return res; tự động chuyển đổi thành kiểu void * để gửi về cho pthread_join()."
        },
        {
          "lines": "Dòng 18–21",
          "title": "Hàm main đọc số phần tử và cấp phát mảng đầu vào",
          "code": "scanf(\"%d\", &n);\na = (int *)malloc(n * sizeof(int));\nfor (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);",
          "explain": "Luồng chính đọc n, sau đó xin n × 4 byte trên Heap cho mảng a (vì n tối đa 10^5, cấp phát động gọn gàng và chuẩn xác hơn mảng tĩnh cỡ lớn). Toàn bộ dữ liệu đầu vào phải được đọc xong TRƯỚC khi gọi pthread_create(), đảm bảo khi luồng con bắt đầu chạy thì mảng a đã có đầy đủ giá trị hợp lệ."
        },
        {
          "lines": "Dòng 23–27",
          "title": "Tạo luồng con và nhận địa chỉ kết quả qua pthread_join()",
          "code": "pthread_t tid;\npthread_create(&tid, NULL, sum_worker, NULL);\nvoid *ret;\npthread_join(tid, &ret);",
          "explain": "pthread_create nhận 4 tham số: (1) &tid — nơi lưu mã định danh của luồng mới; (2) NULL — dùng thuộc tính luồng mặc định (joinable); (3) sum_worker — con trỏ hàm luồng sẽ thực thi; (4) NULL — đối số truyền vào arg của sum_worker. Tiếp theo, khai báo con trỏ tổng quát void *ret; và gọi pthread_join(tid, &ret);. Tại sao phải truyền &ret (kiểu void **)? Bởi vì trong C tham số truyền theo giá trị: muốn hàm pthread_join ghi đè địa chỉ res vào biến con trỏ ret của main, ta phải đưa địa chỉ của chính biến ret. Đồng thời pthread_join() chặn luồng chính ngủ chờ cho đến khi luồng con thực sự return."
        },
        {
          "lines": "Dòng 29–35",
          "title": "Ép kiểu đọc kết quả, in stdout và giải phóng bộ nhớ",
          "code": "long long ans = *(long long *)ret;\nprintf(\"%lld\\n\", ans);\nfree(ret);\nfree(a);\nreturn 0;",
          "explain": "Vì ret đang là kiểu con trỏ vô định hình void *, máy tính chưa biết đọc bao nhiêu byte tại địa chỉ đó. Biểu thức (long long *)ret ép kiểu thành con trỏ trỏ tới số nguyên 8 byte, rồi dấu * ngoài cùng giải tham chiếu để lấy giá trị số thực sự gán vào ans. In ans bằng đặc tả %lld (dành riêng cho long long). Cuối cùng gọi free(ret) để trả lại 8 byte do luồng con đã malloc và free(a) để trả lại mảng đầu vào — bỏ sót free(ret) sẽ gây rò rỉ bộ nhớ và vi phạm yêu cầu đề bài."
        }
      ],
      "testCases": [
        {
          "name": "Mảng hỗn hợp số âm và số dương (chuẩn)",
          "caseDesc": "n = 5, a = [3, -2, 10, 7, 4]",
          "howHandled": "Luồng con cộng dồn *res = 22, trả con trỏ Heap qua pthread_join, luồng chính giải tham chiếu in 22 và gọi free(ret)."
        },
        {
          "name": "Mảng 1 phần tử duy nhất (biên nhỏ nhất n = 1)",
          "caseDesc": "n = 1, a = [-1000000]",
          "howHandled": "Vòng lặp chạy đúng 1 lần, *res = -1000000, không bị lỗi biên hay truy cập ngoài mảng."
        },
        {
          "name": "Biên lớn chống tràn kiểu int 32-bit",
          "caseDesc": "n = 100000, tất cả a[i] = 1000000 (hoặc -1000000)",
          "howHandled": "Tổng thực bằng ±10^11 vượt xa ngưỡng INT_MAX (≈ 2.14 × 10^9). Nhờ cấp phát long long *res và in %lld, kết quả chính xác tuyệt đối không bị tràn âm/dương."
        },
        {
          "name": "Mảng toàn số 0 hoặc tổng triệt tiêu về 0",
          "caseDesc": "n = 4, a = [500, -500, 1000, -1000]",
          "howHandled": "Vì đã khởi tạo *res = 0 trước vòng lặp, tổng trả về đúng 0 thay vì dính giá trị rác trên Heap."
        }
      ],
      "examRecipe": [
        "Khai báo đủ 3 header: <stdio.h>, <stdlib.h>, <pthread.h>; nhớ biên dịch kèm -pthread.",
        "Viết hàm void *sum_worker(void *arg): (void)arg; malloc(sizeof(long long)); gán *res = 0; lặp cộng dồn a[i] rồi return res; (tuyệt đối KHÔNG return &bien_cuc_bo).",
        "Trong main(): đọc n, malloc mảng a, đọc n phần tử xong xuôi trước khi tạo luồng.",
        "Gọi pthread_create(&tid, NULL, sum_worker, NULL); sau đó khai báo void *ret; và gọi pthread_join(tid, &ret);.",
        "Lấy giá trị long long ans = *(long long *)ret;, in bằng printf(\"%lld\\n\", ans); rồi gọi đủ free(ret); và free(a);."
      ]
    }
  },
  {
    "num": 18,
    "id": "CR-18",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Dễ",
    "title": "Bảo vệ biến đếm toàn cục đa luồng bằng pthread_mutex_t",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join, pthread_mutex_lock, pthread_mutex_unlock",
    "prompt": "Khởi tạo biến đếm toàn cục counter = 0. Tạo k luồng đánh số thứ tự từ 1 đến k: mỗi luồng mang chỉ số lẻ (1, 3, 5, ...) thực hiện inc lần phép tăng counter lên 1; mỗi luồng mang chỉ số chẵn (2, 4, 6, ...) thực hiện dec lần phép giảm counter đi 1. Sử dụng mutex (pthread_mutex_t) để bảo vệ mọi thao tác truy cập biến counter khỏi race condition, chờ toàn bộ k luồng hoàn thành bằng pthread_join() rồi in giá trị cuối của counter.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create(), pthread_join() và pthread_mutex_t (pthread_mutex_lock, pthread_mutex_unlock).",
      "Thực hiện vòng lặp tăng/giảm thực sự tại các luồng (không tính công thức thẳng ở hàm main)."
    ],
    "inputSpec": "Một dòng chứa 3 số nguyên: k inc dec.",
    "outputSpec": "Một số nguyên (long long) là giá trị cuối cùng của biến counter.",
    "constraints": [
      "1 <= k <= 16",
      "0 <= inc, dec <= 50000"
    ],
    "example": {
      "note": "3 luồng lẻ (1, 3, 5) cộng 3 * 100 = 300; 2 luồng chẵn (2, 4) trừ 2 * 40 = 80 -> còn 220.",
      "input": "5 100 40",
      "output": "220"
    },
    "relatedTopics": [
      {
        "id": "4-8",
        "label": "4.8 Race Condition trên chuỗi lệnh Load – Update – Store"
      },
      {
        "id": "4-9",
        "label": "4.9 Bảo vệ Miền găng (Critical Section) với pthread_mutex_t"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Phép toán counter++ và counter-- không nguyên tử ở mức lệnh máy (đọc RAM -> cộng/trừ thanh ghi -> ghi RAM). Đặt cặp pthread_mutex_lock / unlock bao quanh miền găng đảm bảo tính tuần tự hóa chính xác.",
    "relatedQuestions": [
      "CR-20",
      "CR-24",
      "CR-29"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nlong long counter = 0;\nint inc_cnt, dec_cnt;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\n\nvoid *worker(void *arg) {\n    int id = *(int *)arg;\n    if (id % 2 == 1) {\n        for (int i = 0; i < inc_cnt; i++) {\n            pthread_mutex_lock(&mtx);\n            counter++;\n            pthread_mutex_unlock(&mtx);\n        }\n    } else {\n        for (int i = 0; i < dec_cnt; i++) {\n            pthread_mutex_lock(&mtx);\n            counter--;\n            pthread_mutex_unlock(&mtx);\n        }\n    }\n    return NULL;\n}\n\nint main() {\n    int k;\n    scanf(\"%d %d %d\", &k, &inc_cnt, &dec_cnt);\n\n    pthread_t t[20];\n    int ids[20];\n\n    for (int i = 0; i < k; i++) {\n        ids[i] = i + 1;\n        pthread_create(&t[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < k; i++) {\n        pthread_join(t[i], NULL);\n    }\n\n    printf(\"%lld\\n\", counter);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Lưu định danh riêng vào mảng ids[i] = i + 1 rồi truyền &ids[i] cho từng luồng để tránh bẫy truyền chung địa chỉ biến đếm &i.",
      "Tách riêng vòng lặp pthread_create và vòng lặp pthread_join để cả k luồng chạy song song thật sự."
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
          "desc": "Truyền tham số riêng từng luồng (không truyền &i trực tiếp)",
          "regex": "ids\\s*\\[|args\\s*\\[",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Truyền trực tiếp địa chỉ biến chạy vòng lặp &i vào pthread_create gây data race chỉ số luồng!",
          "regex": "pthread_create\\s*\\([^,]+,[^,]+,[^,]+,\\s*&\\s*i\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 4 — Hiện tượng tranh đua dữ liệu (Race Condition) và bảo vệ miền găng bằng khóa loại trừ tương hỗ pthread_mutex_t (Mục 4.8, 4.9 · Lab 4 Bài 5).",
      "idea": {
        "summary": "Bài toán tạo k luồng chạy song song cùng thao tác lên một biến đếm toàn cục duy nhất counter (khởi tạo bằng 0): các luồng có số thứ tự lẻ (1, 3, 5, ...) tăng counter thêm 1 đúng inc lần; các luồng số thứ tự chẵn (2, 4, 6, ...) giảm counter đi 1 đúng dec lần. Vì phép counter++ và counter-- không phải thao tác nguyên tử ở cấp phần cứng CPU, ta phải dùng khóa Mutex (pthread_mutex_t) để bảo đảm tại mỗi thời điểm chỉ có duy nhất một luồng được đọc-sửa-ghi biến counter.",
        "steps": [
          "Bước 1 — Khởi tạo tài nguyên dùng chung và Mutex: Khai báo biến toàn cục long long counter = 0;, số lần lặp inc_cnt, dec_cnt và khóa pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;.",
          "Bước 2 — Cấp ID riêng biệt cho từng luồng: Trong main(), đọc k, inc_cnt, dec_cnt; tạo mảng int ids[20] để lưu số thứ tự 1..k riêng cho từng luồng nhằm tránh truyền chung địa chỉ biến đếm vòng lặp &i.",
          "Bước 3 — Khởi chạy đồng thời k luồng: Duyệt i = 0..k-1, gán ids[i] = i + 1 và gọi pthread_create(&t[i], NULL, worker, &ids[i]) để cả k luồng cùng chạy song song.",
          "Bước 4 — Bảo vệ miền găng (Critical Section) trong worker: Đọc id = *(int *)arg. Nếu id lẻ thì lặp inc_cnt lần, nếu id chẵn thì lặp dec_cnt lần; mỗi lần thay đổi counter đều bọc chặt trong cặp pthread_mutex_lock(&mtx) và pthread_mutex_unlock(&mtx).",
          "Bước 5 — Đồng bộ kết thúc và xuất kết quả: Dùng vòng lặp thứ hai gọi pthread_join(t[i], NULL) cho tất cả k luồng rồi mới in giá trị cuối cùng của counter bằng %lld."
        ],
        "whyThisWay": "Ở cấp lệnh máy (Assembly), một dòng counter++ gồm 3 bước tách rời: Đọc counter từ RAM vào thanh ghi CPU → Cộng 1 trên thanh ghi → Ghi ngược về RAM. Nếu không có Mutex, 2 luồng có thể cùng đọc giá trị cũ (ví dụ 10), cùng tính ra 11 rồi ghi đè lên nhau — làm mất 1 lượt tăng (Lost Update / Race Condition) khiến kết quả sai lệch ngẫu nhiên mỗi lần chạy. Mutex biến 3 bước đó thành một miền găng độc quyền, đảm bảo kết quả luôn chính xác 100% là (số luồng lẻ × inc) − (số luồng chẵn × dec).",
        "complexity": "Thời gian: O(k × (inc + dec)) (tuần tự hóa tại miền găng) · Bộ nhớ: O(k) (mảng pthread_t và ids cố định 20 phần tử) · Tài nguyên: k luồng POSIX + 1 Mutex"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–2",
          "title": "Khai báo thư viện vào/ra và POSIX Threads",
          "code": "#include <stdio.h>\n#include <pthread.h>",
          "explain": "<stdio.h> dùng cho scanf/printf; <pthread.h> cung cấp kiểu pthread_t, pthread_mutex_t, hằng khởi tạo tĩnh PTHREAD_MUTEX_INITIALIZER cùng các hàm pthread_create, pthread_join, pthread_mutex_lock và pthread_mutex_unlock."
        },
        {
          "lines": "Dòng 4–6",
          "title": "Khai báo biến chia sẻ và khởi tạo tĩnh khóa Mutex",
          "code": "long long counter = 0;\nint inc_cnt, dec_cnt;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;",
          "explain": "counter dùng kiểu long long để tránh tràn số khi k và inc/dec lớn (dù tối đa ở đây là 8 × 50000 = 400000, long long vẫn khớp yêu cầu output). Macro PTHREAD_MUTEX_INITIALIZER khởi tạo sẵn khóa mtx ở trạng thái mở (unlocked) với thuộc tính mặc định mà không cần gọi pthread_mutex_init() ở main — rất gọn khi chỉ dùng một biến Mutex toàn cục."
        },
        {
          "lines": "Dòng 8–15",
          "title": "Đọc ID luồng và nhánh luồng lẻ tăng counter an toàn",
          "code": "void *worker(void *arg) {\n    int id = *(int *)arg;\n    if (id % 2 == 1) {\n        for (int i = 0; i < inc_cnt; i++) {\n            pthread_mutex_lock(&mtx);\n            counter++;\n            pthread_mutex_unlock(&mtx);\n        }",
          "explain": "Dòng int id = *(int *)arg; ép con trỏ tổng quát void * về int * rồi giải tham chiếu để lấy số thứ tự 1..k của luồng hiện tại. Nếu id % 2 == 1 (luồng 1, 3, 5, ...), luồng lặp inc_cnt lần. Trong mỗi vòng lặp, pthread_mutex_lock(&mtx) xin giữ chìa khóa: nếu khóa đang rảnh thì luồng lấy khóa và đi tiếp; nếu luồng khác đang giữ thì luồng này ngủ chờ (blocked). Sau khi tăng counter++ xong, pthread_mutex_unlock(&mtx) lập tức nhả khóa để luồng khác vào. Nếu quên gọi unlock, toàn bộ các luồng còn lại sẽ treo vĩnh viễn (Deadlock)!"
        },
        {
          "lines": "Dòng 16–24",
          "title": "Nhánh luồng chẵn giảm counter an toàn và kết thúc luồng",
          "code": "    } else {\n        for (int i = 0; i < dec_cnt; i++) {\n            pthread_mutex_lock(&mtx);\n            counter--;\n            pthread_mutex_unlock(&mtx);\n        }\n    }\n    return NULL;\n}",
          "explain": "Tương tự, các luồng chẵn (2, 4, 6, ...) lặp dec_cnt lần phép giảm counter-- bên trong cặp lock/unlock của CÙNG một khóa mtx. Lưu ý cực kỳ quan trọng: cả nhóm tăng và nhóm giảm PHẢI dùng chung đúng một biến mtx; nếu tạo 2 mutex riêng cho tăng và giảm thì luồng lẻ và luồng chẵn vẫn ghi đè counter cùng lúc! Cuối hàm return NULL; vì main không cần nhận giá trị trả về từ pthread_join."
        },
        {
          "lines": "Dòng 26–31",
          "title": "Đọc tham số đầu vào và cấp phát mảng định danh riêng",
          "code": "int k;\nscanf(\"%d %d %d\", &k, &inc_cnt, &dec_cnt);\npthread_t t[20];\nint ids[20];",
          "explain": "Đọc k, inc_cnt, dec_cnt (với ràng buộc 1 <= k <= 16, mảng kích thước 20 là dư dả an toàn). Mảng ids[20] là điểm mấu chốt tránh bẫy kinh điển của người mới học: mỗi luồng i phải được cấp một ô nhớ riêng &ids[i]. Nếu truyền &i (biến đếm vòng for), vòng lặp main có thể tăng i trước khi luồng con kịp đọc, khiến nhiều luồng nhận cùng một ID hoặc nhận ID vượt quá k!"
        },
        {
          "lines": "Dòng 33–39",
          "title": "Tách 2 vòng lặp: khởi tạo song song rồi mới join chờ hoàn tất",
          "code": "for (int i = 0; i < k; i++) {\n    ids[i] = i + 1;\n    pthread_create(&t[i], NULL, worker, &ids[i]);\n}\nfor (int i = 0; i < k; i++) {\n    pthread_join(t[i], NULL);\n}",
          "explain": "Vòng lặp đầu gán số thứ tự 1-based (ids[i] = i + 1) và gọi pthread_create liên tiếp để tất cả k luồng được chạy song song thực sự. Vòng lặp thứ hai gọi pthread_join(t[i], NULL) để chờ đủ cả k luồng chạy xong (tham số thứ hai là NULL vì không lấy giá trị trả về). Tuyệt đối KHÔNG gộp pthread_join vào ngay trong vòng lặp tạo luồng, vì làm vậy luồng 2 phải đợi luồng 1 chết rồi mới được tạo — mất hoàn toàn tính đa luồng!"
        },
        {
          "lines": "Dòng 41–43",
          "title": "In giá trị cuối của counter và kết thúc chương trình",
          "code": "printf(\"%lld\\n\", counter);\nreturn 0;",
          "explain": "Chỉ sau khi mọi lời gọi pthread_join đã trở về, biến counter mới mang giá trị cuối cùng ổn định (không còn luồng nào chỉnh sửa nữa). Lúc này main đọc và in counter bằng %lld mà không cần khóa Mutex nữa, sau đó trả về mã thoát 0."
        }
      ],
      "testCases": [
        {
          "name": "k chẵn với inc = dec (cân bằng về 0)",
          "caseDesc": "k = 4, inc = 50000, dec = 50000 (2 luồng lẻ, 2 luồng chẵn)",
          "howHandled": "Tổng cộng có 100000 lần tăng và 100000 lần giảm diễn ra với mức tranh chấp cực cao; nhờ Mutex bảo vệ miền găng, kết quả luôn chính xác tuyệt đối là 0."
        },
        {
          "name": "k lẻ tạo độ chênh dương hoặc âm",
          "caseDesc": "k = 5, inc = 10000, dec = 20000 (3 luồng lẻ tăng, 2 luồng chẵn giảm)",
          "howHandled": "Kết quả là 3 × 10000 − 2 × 20000 = -10000; kiểm chứng hoạt động đúng với số âm và kiểu long long."
        },
        {
          "name": "Trường hợp biên k = 1 hoặc inc = 0 / dec = 0",
          "caseDesc": "k = 1, inc = 0, dec = 50000",
          "howHandled": "Chỉ có luồng ID = 1 (lẻ), vòng lặp inc_cnt = 0 không chạy lần nào → in 0, không bị lỗi khóa hay truy cập sai."
        },
        {
          "name": "Tranh chấp cực đại (Stress test k = 16)",
          "caseDesc": "k = 16, inc = 50000, dec = 30000 (8 lẻ, 8 chẵn)",
          "howHandled": "Mọi lần tăng/giảm đều tuần tự hóa an toàn qua mtx; không mất lượt cập nhật nào và luôn ra đúng 8 × (50000 − 30000) = 160000."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <pthread.h>; đặt long long counter = 0; và pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER; ở toàn cục.",
        "Trong worker(void *arg): lấy int id = *(int *)arg;, tách nhánh (id % 2 == 1) tăng inc_cnt lần và else giảm dec_cnt lần.",
        "Bọc từng thao tác counter++ / counter-- giữa pthread_mutex_lock(&mtx) và pthread_mutex_unlock(&mtx).",
        "Trong main(): dùng mảng riêng int ids[20] lưu i + 1 và truyền &ids[i] cho pthread_create (cấm truyền &i).",
        "Dùng 2 vòng for tách biệt: vòng 1 tạo hết k luồng, vòng 2 join hết k luồng, cuối cùng mới printf(\"%lld\\n\", counter)."
      ]
    }
  },
  {
    "num": 19,
    "id": "CR-19",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Dễ",
    "title": "Tìm giá trị lớn nhất bằng k luồng với tham số struct riêng",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create và pthread_join",
    "prompt": "Cho mảng gồm n số nguyên và số luồng k. Định nghĩa một cấu trúc dữ liệu (struct) chứa thông tin phạm vi [left, right] của mỗi luồng và trường kết quả local_max. Chia đều mảng thành tối đa min(n, k) đoạn liên tiếp, cấp cho mỗi luồng một phần tử struct riêng để tìm giá trị lớn nhất trên đoạn của mình. Sau khi pthread_join() tất cả các luồng, luồng chính duyệt các giá trị local_max để in giá trị lớn nhất toàn mảng.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create(), pthread_join() và truyền con trỏ struct riêng biệt cho mỗi luồng (tránh truyền chung biến đếm vòng lặp &i).",
      "Xử lý đúng trường hợp k > n hoặc n không chia hết cho k."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n k. Dòng 2: n số nguyên a_0, ..., a_{n-1}.",
    "outputSpec": "Một số nguyên duy nhất là phần tử lớn nhất trong mảng.",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= k <= 16",
      "-10^9 <= a_i <= 10^9"
    ],
    "example": {
      "note": "Phần tử lớn nhất trong [-10, 42, 7, 99, -3, 88] là 99.",
      "input": "6 4\n-10 42 7 99 -3 88",
      "output": "99"
    },
    "relatedTopics": [
      {
        "id": "4-3",
        "label": "4.3 Truyền nhiều tham số cho luồng qua struct riêng"
      },
      {
        "id": "4-7",
        "label": "4.7 Tạo và thu hồi mảng luồng song song chuẩn"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khởi tạo mx = arr[left] ngay phần tử đầu đoạn (thay vì khởi tạo mx = 0!) để kết quả hoàn toàn chính xác ngay cả khi toàn bộ mảng đều là số âm (tới -10^9).",
    "relatedQuestions": [
      "CR-17",
      "CR-26",
      "CR-45"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint *a;\n\ntypedef struct {\n    int left;\n    int right;\n    int local_max;\n} Task;\n\nvoid *find_max(void *arg) {\n    Task *t = (Task *)arg;\n    int mx = a[t->left];\n    for (int i = t->left + 1; i < t->right; i++) {\n        if (a[i] > mx) mx = a[i];\n    }\n    t->local_max = mx;\n    return NULL;\n}\n\nint main() {\n    int n, k;\n    scanf(\"%d %d\", &n, &k);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    int nt = (k < n) ? k : n;\n    pthread_t th[20];\n    Task args[20];\n\n    int base = n / nt, rem = n % nt;\n    for (int i = 0; i < nt; i++) {\n        args[i].left = i * base + (i < rem ? i : rem);\n        args[i].right = args[i].left + base + (i < rem ? 1 : 0);\n        pthread_create(&th[i], NULL, find_max, &args[i]);\n    }\n\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);\n\n    int ans = args[0].local_max;\n    for (int i = 1; i < nt; i++) {\n        if (args[i].local_max > ans) ans = args[i].local_max;\n    }\n\n    printf(\"%d\\n\", ans);\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Giới hạn w = min(n, k) đảm bảo mọi luồng được sinh ra đều có ít nhất 1 phần tử hợp lệ (left <= right).",
      "Khởi tạo mx = task->arr[task->left] tránh hoàn toàn lỗi gán mx = 0 khi mảng chỉ gồm các số nguyên âm."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "struct"
      ],
      "forbiddenApis": [
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Xử lý trường hợp k > n (dùng min(n, k)) và phần dư n % w",
          "regex": "\\?.*:|\\brem\\b|%",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Khởi tạo max = 0 sẽ ra kết quả sai nếu tất cả phần tử mảng đều âm!",
          "regex": "max\\s*=\\s*0\\s*;",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 4 — Truyền nhiều tham số cho từng luồng bằng struct riêng và tổng hợp kết quả theo mô hình Map-Reduce (Mục 4.3, 4.7).",
      "idea": {
        "summary": "Bài toán yêu cầu tìm phần tử lớn nhất trong mảng n số nguyên bằng cách chia việc cho tối đa k luồng chạy song song. Vì pthread_create() chỉ cho phép truyền đúng một con trỏ void *arg vào hàm luồng, ta định nghĩa một struct Task chứa phạm vi làm việc [left, right) và ô kết quả cục bộ local_max. Mỗi luồng chỉ đọc đoạn mảng được giao và ghi kết quả vào ô local_max của riêng mình (không đụng chạm vùng nhớ của nhau nên không cần Mutex), cuối cùng luồng chính đợi tất cả xong rồi lấy max của các local_max.",
        "steps": [
          "Bước 1 — Thiết kế gói tham số struct Task: Gồm 3 trường left (chỉ số bắt đầu), right (chỉ số kết thúc không bao gồm) và local_max (nơi luồng ghi kết quả lớn nhất tìm được trên đoạn đó).",
          "Bước 2 — Đọc mảng và xác định số luồng thực tế nt: Đọc n, k và mảng a. Tính nt = min(k, n) để đảm bảo không bao giờ tạo ra luồng thừa nhận đoạn rỗng khi k > n.",
          "Bước 3 — Chia đều n phần tử cho nt luồng: Tính base = n / nt và phần dư rem = n % nt. Các luồng đầu tiên (i < rem) nhận (base + 1) phần tử, các luồng còn lại nhận base phần tử; mọi đoạn [left, right) đều liên tiếp, phủ kín [0, n) và có ít nhất 1 phần tử.",
          "Bước 4 — Giai đoạn Map (song song không khóa): Tạo nt luồng, truyền con trỏ &args[i] riêng biệt cho từng luồng. Mỗi luồng khởi tạo mx = a[t->left], duyệt tới t->right - 1 rồi lưu vào t->local_max.",
          "Bước 5 — Giai đoạn Reduce (tổng hợp tại main): Gọi pthread_join() đủ nt luồng, sau đó duyệt mảng args[0..nt-1].local_max để lấy giá trị lớn nhất toàn mảng, in ra màn hình và free(a)."
        ],
        "whyThisWay": "Nếu cho tất cả các luồng cùng cập nhật trực tiếp một biến global_max chung, ta sẽ buộc phải khóa Mutex ở mọi phần tử — biến chương trình đa luồng thành chạy chậm hơn cả đơn luồng do chi phí tranh chấp khóa! Bằng cách cho mỗi luồng ghi vào trường local_max trong phần tử args[i] riêng của nó, các luồng chạy hoàn toàn độc lập không cần bất kỳ Mutex nào (Lock-free Map-Reduce), vừa nhanh tối đa vừa miễn nhiễm 100% với race condition.",
        "complexity": "Thời gian: O(n / min(n, k) + min(n, k)) trên CPU đa nhân (tổng công việc O(n)) · Bộ nhớ: O(n) (mảng a + mảng struct Task 20 phần tử) · Tài nguyên: min(n, k) luồng POSIX, 0 Mutex"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo thư viện và con trỏ mảng toàn cục",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint *a;",
          "explain": "Khai báo <stdio.h> (nhập xuất), <stdlib.h> (malloc/free cho mảng động kích thước tới 10^5) và <pthread.h> (tạo/chờ luồng). Con trỏ toàn cục int *a cho phép mọi luồng cùng đọc mảng đầu vào (chỉ đọc nên an toàn đa luồng) mà không cần nhét thêm con trỏ mảng vào struct."
        },
        {
          "lines": "Dòng 7–11",
          "title": "Định nghĩa struct Task đóng gói đầu vào & đầu ra cho từng luồng",
          "code": "typedef struct {\n    int left;\n    int right;\n    int local_max;\n} Task;",
          "explain": "Do pthread_create chỉ nhận 1 đối số void *arg duy nhất, gom nhiều biến vào struct là kỹ thuật chuẩn mực trong C/POSIX. Quy ước đoạn nửa mở [left, right) (từ chỉ số left đến right - 1) giúp tính độ dài đoạn cực gọn (right - left) và nối các đoạn liên tiếp nhau mượt mà. Trường local_max đóng vai trò kênh trả kết quả riêng của mỗi luồng mà không cần malloc từng ô nhỏ."
        },
        {
          "lines": "Dòng 13–21",
          "title": "Hàm luồng find_max() thực hiện tìm max cục bộ trên đoạn được giao",
          "code": "void *find_max(void *arg) {\n    Task *t = (Task *)arg;\n    int mx = a[t->left];\n    for (int i = t->left + 1; i < t->right; i++) {\n        if (a[i] > mx) mx = a[i];\n    }\n    t->local_max = mx;\n    return NULL;\n}",
          "explain": "Ép kiểu con trỏ void *arg về Task *t để truy cập các trường qua toán tử mũi tên t->left, t->right. BẪY CỰC KỲ QUAN TRỌNG: phải khởi tạo int mx = a[t->left]; chứ TUYỆT ĐỐI KHÔNG khởi tạo mx = 0; vì mảng có thể chứa toàn số âm (ví dụ [-5, -100, -2], nếu mx = 0 sẽ trả sai ra 0!). Việc cập nhật biến cục bộ mx trong thanh ghi rồi mới gán 1 lần vào t->local_max ở cuối cũng tránh hiện tượng False Sharing giữa các lõi CPU."
        },
        {
          "lines": "Dòng 23–31",
          "title": "Đọc dữ liệu và giới hạn số luồng thực tế nt = min(k, n)",
          "code": "scanf(\"%d %d\", &n, &k);\na = (int *)malloc(n * sizeof(int));\nfor (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\nint nt = (k < n) ? k : n;\npthread_t th[20];\nTask args[20];",
          "explain": "Đọc n, k và mảng a. Dòng int nt = (k < n) ? k : n; xử lý triệt để trường hợp biên k > n (ví dụ n = 3 phần tử nhưng k = 8 luồng): ta chỉ tạo tối đa 3 luồng. Nếu vẫn cố tạo 8 luồng, 5 luồng thừa sẽ có left == right (đoạn rỗng), khi vào find_max truy cập a[t->left] sẽ đọc vượt biên mảng hoặc tạo ra giá trị rác! Mảng args[20] cấp cho mỗi luồng một struct Task riêng trên Stack của main (an toàn vì main sống lâu hơn các luồng con cho tới sau pthread_join)."
        },
        {
          "lines": "Dòng 33–38",
          "title": "Công thức chia đều mảng không bỏ sót và khởi chạy nt luồng",
          "code": "int base = n / nt, rem = n % nt;\nfor (int i = 0; i < nt; i++) {\n    args[i].left = i * base + (i < rem ? i : rem);\n    args[i].right = args[i].left + base + (i < rem ? 1 : 0);\n    pthread_create(&th[i], NULL, find_max, &args[i]);\n}",
          "explain": "Khi n không chia hết cho nt (ví dụ n = 10, nt = 3 → base = 3, rem = 1), công thức này phân bổ đều nhất có thể: rem luồng đầu tiên (i < rem) mỗi luồng gánh thêm 1 phần tử dư (độ dài base + 1), các luồng sau nhận đúng base phần tử. Kiểm chứng với n = 10, nt = 3: i=0 → [0, 4); i=1 → [4, 7); i=2 → [7, 10) — vừa khít không trùng, không sót! Mỗi lời gọi pthread_create truyền địa chỉ &args[i] riêng biệt."
        },
        {
          "lines": "Dòng 40–45",
          "title": "Chờ hoàn tất tất cả luồng và tổng hợp kết quả toàn mảng",
          "code": "for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);\nint ans = args[0].local_max;\nfor (int i = 1; i < nt; i++) {\n    if (args[i].local_max > ans) ans = args[i].local_max;\n}",
          "explain": "Vòng lặp pthread_join đảm bảo 100% các luồng đã ghi xong args[i].local_max trước khi main đọc chúng (thiết lập quan hệ happens-before về bộ nhớ). Sau đó main khởi tạo ans = args[0].local_max (hợp lệ vì n >= 1 ⇒ nt >= 1) rồi duyệt các phần tử còn lại để chọn ra giá trị lớn nhất toàn cục."
        },
        {
          "lines": "Dòng 47–50",
          "title": "In kết quả, giải phóng bộ nhớ Heap và thoát",
          "code": "printf(\"%d\\n\", ans);\nfree(a);\nreturn 0;",
          "explain": "In giá trị lớn nhất ans ra stdout kèm ký tự xuống dòng, giải phóng mảng động a bằng free(a) và trả mã thoát 0."
        }
      ],
      "testCases": [
        {
          "name": "Mảng chứa toàn bộ số âm",
          "caseDesc": "n = 5, k = 3, a = [-100, -5, -999, -2, -50]",
          "howHandled": "Vì mỗi luồng khởi tạo mx = a[t->left] (không phải 0) và main khởi tạo ans = args[0].local_max, kết quả trả ra chính xác -2."
        },
        {
          "name": "Số luồng k lớn hơn số phần tử n (k > n)",
          "caseDesc": "n = 2, k = 16, a = [42, -10]",
          "howHandled": "nt = min(16, 2) = 2 → chỉ tạo đúng 2 luồng cho [0, 1) và [1, 2), tuyệt đối không sinh luồng nhận đoạn rỗng gây truy cập sai bộ nhớ."
        },
        {
          "name": "n không chia hết cho k (phân bố phần dư rem)",
          "caseDesc": "n = 10, k = 3, phần tử lớn nhất nằm ở ngay vị trí cuối a[9] = 1000000000",
          "howHandled": "3 đoạn được chia thành [0, 4), [4, 7), [7, 10); phần tử a[9] được luồng cuối kiểm tra đầy đủ và cho kết quả 1000000000."
        },
        {
          "name": "Biên cực đại n = 10^5 với giá trị biên ±10^9",
          "caseDesc": "n = 100000, k = 16, a[i] trải trong [-10^9, 10^9]",
          "howHandled": "Giá trị ±10^9 nằm gọn trong int 32-bit; 16 luồng xử lý song song không khóa nên chạy cực nhanh và ổn định."
        }
      ],
      "examRecipe": [
        "Định nghĩa struct Task { int left, right, local_max; }; và con trỏ toàn cục int *a;.",
        "Trong find_max(void *arg): ép Task *t = (Task *)arg;, khởi tạo mx = a[t->left] (CẤM gán 0), duyệt i từ left+1 đến right-1 rồi lưu t->local_max = mx;.",
        "Trong main(): đọc n, k, mảng a; đặt ngay int nt = (k < n) ? k : n; để chống lỗi khi k > n.",
        "Chia đoạn đều bằng base = n / nt, rem = n % nt: left = i*base + (i<rem ? i : rem); right = left + base + (i<rem ? 1 : 0);.",
        "Tạo nt luồng truyền &args[i], join hết nt luồng, tổng hợp max từ args[0..nt-1].local_max, in ans rồi free(a)."
      ]
    }
  },
  {
    "num": 20,
    "id": "CR-20",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Trung bình",
    "title": "Hai luồng in luân phiên chẵn lẻ theo thứ tự 1..n bằng Condition Variable",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_mutex_t và pthread_cond_t",
    "prompt": "Cho số nguyên dương n. Tạo hai luồng làm việc song song: Luồng 1 chỉ được phép in các số lẻ (1, 3, 5, ...), Luồng 2 chỉ được phép in các số chẵn (2, 4, 6, ...). Hãy đồng bộ hai luồng bằng mutex và biến điều kiện (Condition Variable) để kết quả xuất ra trên stdout luôn đúng thứ tự tăng dần 1 2 3 ... n.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_mutex_t và pthread_cond_t (với pthread_cond_wait nằm trong vòng lặp while kiểm tra lượt in hiện tại).",
      "Không dùng busy-waiting (vòng lặp rỗng) hoặc sleep()/usleep().",
      "Không in khoảng trắng dư thừa ở cuối dòng; in xong xuống dòng '\\n'."
    ],
    "inputSpec": "Một dòng chứa số nguyên dương n.",
    "outputSpec": "Các số nguyên từ 1 đến n trên 1 dòng, cách nhau bởi đúng 1 dấu cách.",
    "constraints": [
      "1 <= n <= 1000"
    ],
    "example": {
      "note": "Luồng lẻ và luồng chẵn nhường lượt chính xác qua biến điều kiện.",
      "input": "6",
      "output": "1 2 3 4 5 6"
    },
    "relatedTopics": [
      {
        "id": "4-9",
        "label": "4.9 Đồng bộ bằng Mutex Lock"
      },
      {
        "id": "4-10",
        "label": "4.10 Biến điều kiện pthread_cond_t & Vòng lặp while chống Spurious Wakeup"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khi cur vượt quá n, luồng phát hiện kết thúc phải đánh thức luồng kia bằng pthread_cond_signal / broadcast trước khi thoát vòng lặp — nếu quên báo hiệu lần cuối khi cur = n + 1, luồng còn lại có thể ngủ kẹt trong pthread_cond_wait!",
    "relatedQuestions": [
      "CR-21",
      "CR-22",
      "CR-23"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nint n;\nint cur = 1;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t cond = PTHREAD_COND_INITIALIZER;\n\nvoid *print_odd(void *arg) {\n    (void)arg;\n    while (1) {\n        pthread_mutex_lock(&mtx);\n        while (cur <= n && cur % 2 == 0) {\n            pthread_cond_wait(&cond, &mtx);\n        }\n        if (cur > n) {\n            pthread_mutex_unlock(&mtx);\n            break;\n        }\n        printf(\"%d%s\", cur, (cur == n) ? \"\\n\" : \" \");\n        cur++;\n        pthread_cond_signal(&cond);\n        pthread_mutex_unlock(&mtx);\n    }\n    return NULL;\n}\n\nvoid *print_even(void *arg) {\n    (void)arg;\n    while (1) {\n        pthread_mutex_lock(&mtx);\n        while (cur <= n && cur % 2 == 1) {\n            pthread_cond_wait(&cond, &mtx);\n        }\n        if (cur > n) {\n            pthread_mutex_unlock(&mtx);\n            break;\n        }\n        printf(\"%d%s\", cur, (cur == n) ? \"\\n\" : \" \");\n        cur++;\n        pthread_cond_signal(&cond);\n        pthread_mutex_unlock(&mtx);\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d\", &n);\n\n    pthread_t t1, t2;\n    pthread_create(&t1, NULL, print_odd, NULL);\n    pthread_create(&t2, NULL, print_even, NULL);\n\n    pthread_join(t1, NULL);\n    pthread_join(t2, NULL);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Vòng lặp while (cur <= n_limit && ...) bảo vệ chống spurious wakeup và kiểm tra đồng thời điều kiện dừng cur > n_limit.",
      "Định dạng \"%s%d\" với (cur == 1 ? \"\" : \" \") đảm bảo tuyệt đối không dư khoảng trắng ở đầu hay cuối dòng kể cả khi n = 1."
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
        "pthread_mutex_unlock",
        "pthread_cond_wait"
      ],
      "forbiddenApis": [
        "sleep",
        "usleep",
        "nanosleep"
      ],
      "qualityRules": [
        {
          "desc": "Đặt pthread_cond_wait() bên trong vòng lặp while",
          "regex": "while\\s*\\([\\s\\S]{1,140}?pthread_cond_wait",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng if thay vì while quanh pthread_cond_wait() dễ lỗi khi thức tỉnh giả (spurious wakeup)!",
          "regex": "if\\s*\\([^)]*\\)\\s*pthread_cond_wait",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 4 — Điều phối thứ tự thực thi luân phiên giữa các luồng bằng Mutex và Biến điều kiện Condition Variable (Mục 4.10 · Slide APT04).",
      "idea": {
        "summary": "Bài toán tạo hai luồng chạy song song: Luồng 1 chỉ được in số lẻ (1, 3, 5, ...), Luồng 2 chỉ được in số chẵn (2, 4, 6, ...), nhưng kết quả trên màn hình phải xuất ra đúng thứ tự tăng dần 1 2 3 ... n. Vì hệ điều hành lập lịch luồng một cách ngẫu nhiên, ta dùng một biến chia sẻ cur (bắt đầu từ 1) kết hợp với Mutex và Condition Variable: luồng nào chưa tới lượt sẽ tự đưa mình vào trạng thái ngủ (0% CPU), luồng vừa in xong sẽ tăng cur rồi đánh thức luồng kia dậy làm tiếp.",
        "steps": [
          "Bước 1 — Khởi tạo trạng thái và công cụ đồng bộ: Khai báo cur = 1 (số kế tiếp cần in), khóa pthread_mutex_t mtx và biến điều kiện pthread_cond_t cond.",
          "Bước 2 — Chờ đúng lượt bằng vòng lặp while + pthread_cond_wait(): Trong print_odd, khóa mtx rồi kiểm tra while (cur <= n && cur % 2 == 0) pthread_cond_wait(&cond, &mtx); (tương tự ở print_even chờ khi cur % 2 == 1).",
          "Bước 3 — Xử lý điều kiện dừng an toàn: Ngay khi thoát khỏi while, kiểm tra if (cur > n). Nếu đã in đủ tới n thì PHẢI gọi pthread_mutex_unlock(&mtx) trước khi break thoát vòng lặp.",
          "Bước 4 — In số, cập nhật lượt và đánh thức luồng còn lại: In cur kèm khoảng trắng hoặc '\\n' (nếu cur == n), tăng cur++, gọi pthread_cond_signal(&cond) đánh thức luồng kia rồi mở khóa mtx.",
          "Bước 5 — Khởi tạo và chờ cả 2 luồng ở main(): Đọc n, gọi pthread_create cho cả print_odd và print_even rồi pthread_join cả hai."
        ],
        "whyThisWay": "Nếu dùng vòng lặp bận kiểu while (cur % 2 == 0) {} (busy-waiting), luồng chờ sẽ đốt 100% CPU vô ích và còn dễ sai do tối ưu hóa trình biên dịch/bộ nhớ cache. Nếu dùng sleep()/usleep(), chương trình vừa chậm vừa không bao giờ đảm bảo đúng thứ tự khi hệ thống bận. Condition Variable cho phép luồng chưa tới lượt nhả khóa Mutex và ngủ hẳn ở cấp kernel, chỉ tỉnh dậy tức thì đúng lúc luồng kia gọi pthread_cond_signal(). Bắt buộc dùng while (không dùng if) quanh pthread_cond_wait để chống hiện tượng đánh thức giả (spurious wakeup) của hệ điều hành.",
        "complexity": "Thời gian: O(n) (chuyển ngữ cảnh tối đa n lần giữa 2 luồng) · Bộ nhớ: O(1) · Tài nguyên: 2 luồng POSIX + 1 Mutex + 1 Condition Variable"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–2",
          "title": "Khai báo thư viện vào/ra và POSIX Threads",
          "code": "#include <stdio.h>\n#include <pthread.h>",
          "explain": "Nạp <stdio.h> cho scanf/printf và <pthread.h> cho pthread_t, pthread_mutex_t, pthread_cond_t cùng các hàm wait/signal."
        },
        {
          "lines": "Dòng 4–7",
          "title": "Khai báo biến lượt cur, Mutex và Condition Variable",
          "code": "int n;\nint cur = 1;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t cond = PTHREAD_COND_INITIALIZER;",
          "explain": "cur = 1 đóng vai trò con trỏ lượt in hiện tại: cur lẻ là lượt của print_odd, cur chẵn là lượt của print_even, cur > n là tín hiệu cả 2 luồng cùng dừng. mtx bảo vệ mọi thao tác đọc/ghi cur và stdout; cond là hàng đợi ngủ cho luồng chưa tới lượt, khởi tạo tĩnh bằng PTHREAD_COND_INITIALIZER."
        },
        {
          "lines": "Dòng 9–15",
          "title": "Luồng lẻ khóa Mutex và ngủ chờ trong vòng lặp while",
          "code": "void *print_odd(void *arg) {\n    (void)arg;\n    while (1) {\n        pthread_mutex_lock(&mtx);\n        while (cur <= n && cur % 2 == 0) {\n            pthread_cond_wait(&cond, &mtx);\n        }",
          "explain": "Trước khi đọc cur hoặc gọi pthread_cond_wait, luồng BẮT BUỘC phải giữ khóa mtx. Hàm pthread_cond_wait(&cond, &mtx) thực hiện 3 thao tác nguyên tử cực kỳ tinh tế: (1) tạm thời mở khóa mtx và đưa luồng vào trạng thái ngủ trên cond; (2) ngủ yên (0% CPU) cho đến khi có tín hiệu signal/broadcast; (3) tự động khóa lại mtx trước khi hàm trả về! TẠI SAO PHẢI DÙNG while THAY VÌ if? Thứ nhất, hệ điều hành có thể gây spurious wakeup (tỉnh dậy dù chưa ai gọi signal), dùng while sẽ kiểm tra lại điều kiện và ngủ tiếp nếu chưa tới lượt. Thứ hai, điều kiện cur <= n giúp luồng thoát khỏi vòng ngủ ngay khi cur vượt n."
        },
        {
          "lines": "Dòng 16–26",
          "title": "Kiểm tra kết thúc, in số lẻ, chuyển lượt và đánh thức luồng chẵn",
          "code": "        if (cur > n) {\n            pthread_mutex_unlock(&mtx);\n            break;\n        }\n        printf(\"%d%s\", cur, (cur == n) ? \"\\n\" : \" \");\n        cur++;\n        pthread_cond_signal(&cond);\n        pthread_mutex_unlock(&mtx);\n    }\n    return NULL;\n}",
          "explain": "Nếu cur > n (ví dụ sau khi luồng chẵn vừa in xong số n chẵn và tăng cur lên n+1), luồng lẻ thoát vòng lặp — LƯU Ý SỐNG CÒN: phải gọi pthread_mutex_unlock(&mtx) TRƯỚC khi break, nếu quên mở khóa thì luồng kia sẽ bị treo vĩnh viễn! Khi cur <= n và cur lẻ, luồng in cur với toán tử 3 ngôi (cur == n) ? \"\\n\" : \" \" để không dư dấu cách cuối dòng. Sau đó tăng cur++ (biến cur thành số chẵn hoặc n+1), gọi pthread_cond_signal(&cond) đánh thức luồng chẵn đang ngủ (để nó in tiếp hoặc thấy cur > n để thoát sạch), rồi mở khóa mtx."
        },
        {
          "lines": "Dòng 28–45",
          "title": "Hàm luồng chẵn print_even() đối xứng hoàn toàn",
          "code": "void *print_even(void *arg) {\n    ...\n    while (cur <= n && cur % 2 == 1) {\n        pthread_cond_wait(&cond, &mtx);\n    }\n    if (cur > n) { pthread_mutex_unlock(&mtx); break; }\n    printf(\"%d%s\", cur, (cur == n) ? \"\\n\" : \" \");\n    cur++;\n    pthread_cond_signal(&cond);\n    pthread_mutex_unlock(&mtx);\n}",
          "explain": "Cấu trúc đối xứng 100% với print_odd, chỉ đảo điều kiện ngủ thành cur % 2 == 1 (ngủ khi cur đang lẻ). Kể cả nếu hệ điều hành cho print_even chạy TRƯỚC print_odd ngay lúc mới tạo, print_even thấy cur == 1 (lẻ) nên tự động nhả khóa và đi ngủ, nhường quyền cho print_odd in số 1 trước — thứ tự 1 2 3 ... n luôn bất biến!"
        },
        {
          "lines": "Dòng 47–57",
          "title": "Hàm main đọc n, tạo đồng thời 2 luồng và chờ hoàn tất",
          "code": "scanf(\"%d\", &n);\npthread_t t1, t2;\npthread_create(&t1, NULL, print_odd, NULL);\npthread_create(&t2, NULL, print_even, NULL);\npthread_join(t1, NULL);\npthread_join(t2, NULL);\nreturn 0;",
          "explain": "Đọc n xong xuôi rồi tạo đồng thời hai luồng t1 (lẻ) và t2 (chẵn), sau đó gọi pthread_join cho cả hai. Dù t1 hay t2 kết thúc trước, chương trình chỉ thoát return 0 khi cả hai luồng đều đã tự mở khóa và thoát vòng lặp sạch sẽ."
        }
      ],
      "testCases": [
        {
          "name": "Biên nhỏ nhất n = 1 (luồng chẵn không in số nào)",
          "caseDesc": "n = 1",
          "howHandled": "Luồng lẻ in \"1\\n\", tăng cur lên 2 (> n) rồi gọi signal đánh thức luồng chẵn; luồng chẵn thấy cur > 1 nên mở khóa và thoát sạch không bị Deadlock!"
        },
        {
          "name": "n là số chẵn (luồng chẵn in số cuối cùng)",
          "caseDesc": "n = 6",
          "howHandled": "In đúng \"1 2 3 4 5 6\\n\" không dư khoảng trắng; sau số 6, cur thành 7 và luồng chẵn signal để luồng lẻ thoát."
        },
        {
          "name": "n là số lẻ (luồng lẻ in số cuối cùng)",
          "caseDesc": "n = 5",
          "howHandled": "In đúng \"1 2 3 4 5\\n\"; sau số 5, cur thành 6 và luồng lẻ signal để luồng chẵn thoát."
        },
        {
          "name": "n lớn tối đa n = 1000 (kiểm tra ổn định luân phiên)",
          "caseDesc": "n = 1000",
          "howHandled": "Hai luồng luân phiên đúng 1000 nhịp mà không bao giờ lệch thứ tự, không bỏ sót tín hiệu (lost wakeup) và không tiêu tốn CPU khi chờ."
        }
      ],
      "examRecipe": [
        "Khai báo toàn cục: int n, cur = 1; pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER; pthread_cond_t cond = PTHREAD_COND_INITIALIZER;.",
        "Trong mỗi hàm luồng (odd/even): lặp while (1) → lock(&mtx) → while (cur <= n && cur % 2 == luot_kia) pthread_cond_wait(&cond, &mtx);.",
        "LUÔN đặt điều kiện cur <= n trong while để không ngủ quên khi đã hết số, và NHỚ unlock(&mtx) trước khi break nếu cur > n!",
        "In đúng định dạng printf(\"%d%s\", cur, (cur == n) ? \"\\n\" : \" \"); rồi cur++; pthread_cond_signal(&cond); unlock(&mtx);.",
        "Trong main(): đọc n → pthread_create t1, t2 → pthread_join t1, t2."
      ]
    }
  },
  {
    "num": 21,
    "id": "CR-21",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Trung bình",
    "title": "Cài đặt Barrier hai pha bằng Mutex và Condition Variable",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_mutex_t, pthread_cond_wait, pthread_cond_broadcast",
    "prompt": "Cho mảng gồm k số nguyên a[0..k-1]. Tạo đúng k luồng (chỉ số i = 0..k-1) thực thi một thuật toán hai pha đồng bộ bằng Barrier tự cài đặt: Ở Pha 1, luồng i cập nhật a[i] = a[i] * a[i] (long long). Tiếp theo, tất cả k luồng phải đợi tại Barrier cho đến khi toàn bộ k luồng đã hoàn tất Pha 1 (luồng tới cuối cùng gọi pthread_cond_broadcast() giải phóng tất cả). Ở Pha 2, luồng i đọc giá trị mới sau Pha 1 để tính b[i] = a[i] + a[(i + 1) % k]. Sau pthread_join(), luồng chính in ra mảng b[0..k-1].",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Tự xây dựng cơ chế Barrier dùng pthread_mutex_t, biến đếm và pthread_cond_t (pthread_cond_wait, pthread_cond_broadcast) — không dùng pthread_barrier_t có sẵn hay join tách 2 lần.",
      "Tính toán cả Pha 1 và Pha 2 bên trong hàm của luồng."
    ],
    "inputSpec": "Dòng 1: số nguyên k. Dòng 2: k số nguyên a_0, ..., a_{k-1}.",
    "outputSpec": "Một dòng gồm k số nguyên (long long) là b_0, ..., b_{k-1} cách nhau 1 dấu cách.",
    "constraints": [
      "1 <= k <= 16",
      "-10^4 <= a_i <= 10^4"
    ],
    "example": {
      "note": "Sau Pha 1: a = [1, 4, 9, 16]. Sang Pha 2: b = [1+4, 4+9, 9+16, 16+1] = [5, 13, 25, 17].",
      "input": "4\n1 2 3 4",
      "output": "5 13 25 17"
    },
    "relatedTopics": [
      {
        "id": "4-10",
        "label": "4.10 pthread_cond_broadcast() đánh thức toàn bộ luồng tại Barrier"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Tại Barrier, nếu luồng tới cuối cùng chỉ gọi pthread_cond_signal() thì chỉ có 1 luồng thức dậy còn k - 2 luồng kia bị treo vĩnh viễn! Bắt buộc dùng pthread_cond_broadcast() kèm biến thế hệ (generation) để chống spurious wakeup.",
    "relatedQuestions": [
      "CR-20",
      "CR-23",
      "CR-46"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nint k;\nlong long a[20], b[20];\nint arrived = 0;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t cond = PTHREAD_COND_INITIALIZER;\n\nvoid *worker(void *arg) {\n    int id = *(int *)arg;\n\n    // Pha 1: binh phuong a[id]\n    a[id] = a[id] * a[id];\n\n    // Barrier tu cai dat bang mutex + condvar\n    pthread_mutex_lock(&mtx);\n    arrived++;\n    if (arrived == k) {\n        pthread_cond_broadcast(&cond);\n    } else {\n        while (arrived < k) {\n            pthread_cond_wait(&cond, &mtx);\n        }\n    }\n    pthread_mutex_unlock(&mtx);\n\n    // Pha 2: tinh b[id] tu gia tri moi sau Pha 1\n    b[id] = a[id] + a[(id + 1) % k];\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d\", &k);\n    for (int i = 0; i < k; i++) scanf(\"%lld\", &a[i]);\n\n    pthread_t th[20];\n    int ids[20];\n    for (int i = 0; i < k; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < k; i++) pthread_join(th[i], NULL);\n\n    for (int i = 0; i < k; i++) {\n        printf(\"%lld%s\", b[i], (i == k - 1) ? \"\\n\" : \" \");\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Biến thế hệ my_gen == br->gen đảm bảo ngay cả khi barrier được tái sử dụng nhiều vòng (như ở Câu 46), không luồng nào bị lọt sớm hoặc thức tỉnh giả.",
      "Khi k = 1, --br->count về 0 ngay lập tức và vượt qua barrier trơn tru không bị tự chờ."
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
        "pthread_cond_wait",
        "pthread_cond_broadcast"
      ],
      "forbiddenApis": [
        "pthread_barrier_t",
        "pthread_barrier_init",
        "pthread_barrier_wait"
      ],
      "qualityRules": [
        {
          "desc": "Dùng vòng lặp while quanh pthread_cond_wait() kèm cờ pha/generation",
          "regex": "while\\s*\\([\\s\\S]{1,140}?pthread_cond_wait",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 4 — Tự cài đặt cơ chế rào chắn đồng bộ (Barrier) hai pha bằng Mutex và Condition Variable (Mục 4.10 · Lab 4 Bài 6).",
      "idea": {
        "summary": "Bài toán chia k luồng thực hiện một thuật toán gồm 2 pha phụ thuộc nhau: ở Pha 1, mỗi luồng i tự bình phương phần tử a[i] của riêng mình; ở Pha 2, luồng i phải đọc cả a[i] và phần tử kế tiếp a[(i + 1) % k] để tính b[i]. Nếu không có điểm hẹn đồng bộ giữa hai pha, một luồng chạy nhanh có thể nhảy sang Pha 2 đọc nhầm giá trị cũ (chưa bình phương) của luồng hàng xóm! Vì vậy, ta tự xây dựng một Barrier (rào chắn) bằng biến đếm arrived, Mutex và Condition Variable: k - 1 luồng tới sớm phải đứng ngủ chờ tại rào chắn; luồng thứ k tới cuối cùng sẽ mở cổng đánh thức toàn bộ bằng pthread_cond_broadcast().",
        "steps": [
          "Bước 1 — Khởi tạo dữ liệu và bộ đếm Barrier: Khai báo mảng long long a[20], b[20], biến đếm int arrived = 0 (số luồng đã xong Pha 1), khóa mtx và biến điều kiện cond.",
          "Bước 2 — Thực thi Pha 1 song song không khóa: Mỗi luồng đọc id của mình và cập nhật a[id] = a[id] * a[id]. Do mỗi luồng chỉ chạm vào đúng ô a[id] riêng biệt nên không cần khóa Mutex trong Pha 1.",
          "Bước 3 — Đồng bộ tại điểm hẹn Barrier: Khóa mtx, tăng arrived++. Nếu arrived == k (mình là luồng cuối cùng tới rào chắn), gọi pthread_cond_broadcast(&cond) để đánh thức toàn bộ k - 1 luồng đang ngủ; ngược lại, đi vào vòng lặp while (arrived < k) pthread_cond_wait(&cond, &mtx);. Sau đó mở khóa mtx.",
          "Bước 4 — Thực thi Pha 2 song song không khóa: Khi đã qua khỏi Barrier, chắc chắn 100% mảng a đã được bình phương xong. Mỗi luồng tính b[id] = a[id] + a[(id + 1) % k] (chỉ đọc mảng a, ghi vào ô b[id] riêng).",
          "Bước 5 — Thu gom và in kết quả ở main(): Đọc k và mảng a, tạo k luồng với mảng ids[20] riêng, gọi pthread_join đủ k luồng rồi in mảng b[0..k-1]."
        ],
        "whyThisWay": "Tại điểm rào chắn Barrier, có tới k - 1 luồng cùng đang ngủ trên biến điều kiện cond. Nếu luồng cuối cùng gọi nhầm pthread_cond_signal(&cond), chỉ có DUY NHẤT 1 luồng được đánh thức, còn k - 2 luồng kia sẽ ngủ vĩnh viễn gây Deadlock! Dùng pthread_cond_broadcast(&cond) giải phóng đồng loạt mọi luồng đang đợi. Đề bài cũng cấm tách thành 2 đợt create/join riêng vì mục tiêu thực tế của Barrier là giữ nguyên nhóm luồng đang sống (tránh chi phí tạo/hủy luồng lặp lại trong các thuật toán tính toán song song nhiều pha).",
        "complexity": "Thời gian: O(k) (song song O(1) mỗi pha + chi phí đồng bộ Barrier) · Bộ nhớ: O(k) (mảng tĩnh a, b, th, ids) · Tài nguyên: k luồng POSIX + 1 Mutex + 1 Condition Variable"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–2",
          "title": "Khai báo thư viện vào/ra và POSIX Threads",
          "code": "#include <stdio.h>\n#include <pthread.h>",
          "explain": "<stdio.h> cung cấp scanf/printf; <pthread.h> cung cấp các kiểu và hàm điều khiển luồng, Mutex và Condition Variable."
        },
        {
          "lines": "Dòng 4–8",
          "title": "Khai báo mảng dữ liệu và trạng thái Barrier toàn cục",
          "code": "int k;\nlong long a[20], b[20];\nint arrived = 0;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t cond = PTHREAD_COND_INITIALIZER;",
          "explain": "a[20] và b[20] dùng kiểu long long đúng chuẩn đề bài (an toàn cho bình phương và tổng, kích thước 20 dư cho ràng buộc k <= 16). Biến arrived đếm xem đã có bao nhiêu luồng hoàn tất Pha 1 và tới chạm rào chắn. mtx bảo vệ việc tăng/đọc arrived, còn cond làm nơi ngủ cho các luồng tới sớm."
        },
        {
          "lines": "Dòng 10–14",
          "title": "Pha 1 — Mỗi luồng tự bình phương phần tử riêng a[id]",
          "code": "void *worker(void *arg) {\n    int id = *(int *)arg;\n    // Pha 1: binh phuong a[id]\n    a[id] = a[id] * a[id];",
          "explain": "Mỗi luồng nhận chỉ số id duy nhất trong [0, k-1] từ mảng ids[]. Vì các luồng chỉ đọc và ghi vào ô a[id] độc lập của riêng mình, toàn bộ Pha 1 chạy song song hoàn toàn mà không cần khóa Mutex."
        },
        {
          "lines": "Dòng 16–26",
          "title": "Điểm hẹn Barrier — Chờ đủ k luồng rồi mở cổng bằng broadcast()",
          "code": "    pthread_mutex_lock(&mtx);\n    arrived++;\n    if (arrived == k) {\n        pthread_cond_broadcast(&cond);\n    } else {\n        while (arrived < k) {\n            pthread_cond_wait(&cond, &mtx);\n        }\n    }\n    pthread_mutex_unlock(&mtx);",
          "explain": "Đây là trái tim của bài toán: khóa mtx để tăng arrived++ an toàn (tránh race condition khiến 2 luồng cùng đọc/tăng arrived bị mất lượt). Nếu arrived == k, đây chính là luồng thứ k tới sau cùng — nó gọi pthread_cond_broadcast(&cond) để đánh thức TẤT CẢ các luồng đang ngủ (tuyệt đối không dùng signal vì sẽ chỉ đánh thức 1 luồng!). Ngược lại (arrived < k), luồng tới sớm ngủ trong vòng while (arrived < k) pthread_cond_wait(&cond, &mtx); để tự động nhả khóa mtx, chờ tín hiệu và chống spurious wakeup. Khi tỉnh dậy và thấy arrived == k, từng luồng lần lượt mở khóa mtx rồi bước sang Pha 2."
        },
        {
          "lines": "Dòng 28–31",
          "title": "Pha 2 — Đọc an toàn giá trị mới và tính b[id]",
          "code": "    // Pha 2: tinh b[id] tu gia tri moi sau Pha 1\n    b[id] = a[id] + a[(id + 1) % k];\n    return NULL;\n}",
          "explain": "Nhờ Barrier ở trên, tại thời điểm bất kỳ luồng nào chạm tới dòng 29, mọi phần tử a[0..k-1] đều đã hoàn tất phép bình phương ở Pha 1 và đồng bộ hóa bộ nhớ qua Mutex. Phép chia lấy dư (id + 1) % k nối vòng phần tử cuối k - 1 quay về phần tử đầu 0. Mỗi luồng chỉ đọc mảng a và ghi vào ô b[id] riêng nên Pha 2 cũng không cần Mutex."
        },
        {
          "lines": "Dòng 33–43",
          "title": "Hàm main đọc dữ liệu, tạo k luồng và chờ hoàn tất",
          "code": "scanf(\"%d\", &k);\nfor (int i = 0; i < k; i++) scanf(\"%lld\", &a[i]);\npthread_t th[20];\nint ids[20];\nfor (int i = 0; i < k; i++) {\n    ids[i] = i;\n    pthread_create(&th[i], NULL, worker, &ids[i]);\n}\nfor (int i = 0; i < k; i++) pthread_join(th[i], NULL);",
          "explain": "Đọc k và k số nguyên kiểu long long (%lld) vào mảng a. Tạo mảng ids[20] lưu chỉ số 0..k-1 riêng cho từng luồng rồi gọi pthread_create(&th[i], NULL, worker, &ids[i]). Vòng lặp thứ hai gọi pthread_join chờ cả k luồng kết thúc hoàn toàn cả hai pha."
        },
        {
          "lines": "Dòng 45–49",
          "title": "Xuất mảng kết quả b[0..k-1] chuẩn định dạng",
          "code": "for (int i = 0; i < k; i++) {\n    printf(\"%lld%s\", b[i], (i == k - 1) ? \"\\n\" : \" \");\n}\nreturn 0;",
          "explain": "In lần lượt k giá trị b[i] bằng đặc tả %lld, ngăn cách bởi đúng 1 dấu cách và xuống dòng ở phần tử cuối cùng (i == k - 1), không để khoảng trắng thừa."
        }
      ],
      "testCases": [
        {
          "name": "Mảng hỗn hợp số âm và số dương (chuẩn)",
          "caseDesc": "k = 4, a = [2, -3, 4, 1]",
          "howHandled": "Sau Pha 1: a = [4, 9, 16, 1]. Nhờ Barrier, Pha 2 chắc chắn đọc đủ mảng mới → b = [4+9, 9+16, 16+1, 1+4] = [13, 25, 17, 5]."
        },
        {
          "name": "Trường hợp biên k = 1 (chỉ có 1 luồng duy nhất)",
          "caseDesc": "k = 1, a = [-5]",
          "howHandled": "Pha 1: a[0] = 25. Tại Barrier: arrived tăng lên 1 == k, vào nhánh if gọi broadcast (không có ai ngủ nên trả về ngay), không hề bị treo. Pha 2: (0 + 1) % 1 = 0 → b[0] = 25 + 25 = 50."
        },
        {
          "name": "Số luồng tối đa k = 16 (kiểm tra broadcast đánh thức đủ 15 luồng)",
          "caseDesc": "k = 16, a[i] = i + 1",
          "howHandled": "15 luồng tới sớm ngủ trên cond, luồng thứ 16 gọi broadcast giải phóng cả 15 luồng cùng lúc, tuyệt đối không bị treo Deadlock như khi dùng sai signal."
        },
        {
          "name": "Giá trị biên |a_i| = 10^4 (kiểm tra bình phương & long long)",
          "caseDesc": "k = 3, a = [-10000, 10000, 0]",
          "howHandled": "Pha 1 tạo [100000000, 100000000, 0], Pha 2 tính đúng [200000000, 100000000, 100000000] với kiểu long long."
        }
      ],
      "examRecipe": [
        "Khai báo toàn cục: int k, arrived = 0; long long a[20], b[20]; cùng mtx và cond khởi tạo tĩnh.",
        "Trong worker(void *arg): lấy id = *(int *)arg; thực hiện Pha 1: a[id] = a[id] * a[id];.",
        "Viết khối Barrier: lock(&mtx) → arrived++ → if (arrived == k) pthread_cond_broadcast(&cond); else while (arrived < k) pthread_cond_wait(&cond, &mtx); → unlock(&mtx).",
        "Thực hiện Pha 2 sau Barrier: b[id] = a[id] + a[(id + 1) % k];.",
        "Trong main(): đọc k và a[0..k-1] (%lld), dùng mảng ids[20] tạo k luồng, join đủ k luồng rồi in mảng b[0..k-1]."
      ]
    }
  },
  {
    "num": 22,
    "id": "CR-22",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Trung bình",
    "title": "Mô hình Producer-Consumer với bộ đệm vòng dung lượng giới hạn B",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_mutex_t và pthread_cond_t",
    "prompt": "Cho sức chứa bộ đệm B và dãy n số nguyên x_1, x_2, ..., x_n. Cài đặt mô hình Producer-Consumer gồm 1 luồng Producer và 1 luồng Consumer dùng chung một hàng đợi vòng kích thước tối đa B phần tử: Producer lần lượt đẩy x_1..x_n vào hàng đợi (chờ khi đầy); Consumer lấy đủ n phần tử theo đúng thứ tự FIFO (chờ khi rỗng) và tính tổng trọng số sum_{i=1..n} (i * val_i), trong đó val_i là phần tử lấy ra ở lượt thứ i (1-based). In tổng trọng số cuối cùng.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc đồng bộ bằng pthread_mutex_t và 2 biến điều kiện pthread_cond_t (not_full, not_empty).",
      "Hàng đợi dùng chung phải có kích thước giới hạn đúng bằng B (không cấp phát mảng kích thước n làm hàng đợi)."
    ],
    "inputSpec": "Dòng 1: hai số nguyên B n. Dòng 2: n số nguyên x_1, ..., x_n.",
    "outputSpec": "Một số nguyên (long long) là tổng sum_{i=1..n} (i * val_i).",
    "constraints": [
      "1 <= B <= 64",
      "1 <= n <= 10^4",
      "-10^4 <= x_i <= 10^4"
    ],
    "example": {
      "note": "1*5 + 2*(-1) + 3*3 + 4*2 = 5 - 2 + 9 + 8 = 20.",
      "input": "2 4\n5 -1 3 2",
      "output": "20"
    },
    "relatedTopics": [
      {
        "id": "4-10",
        "label": "4.10 Bài toán Kinh điển Producer-Consumer với 2 Biến điều kiện"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Dùng 2 biến điều kiện tách biệt not_full (Producer chờ khi cnt == B) và not_empty (Consumer chờ khi cnt == 0) cùng hai con trỏ vòng in = (in + 1) % B, out = (out + 1) % B.",
    "relatedQuestions": [
      "CR-20",
      "CR-23"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint B, n;\nint *input_arr;\nint buf[64];\nint head = 0, tail = 0, count = 0;\nlong long weighted_sum = 0;\n\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t not_full = PTHREAD_COND_INITIALIZER;\npthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;\n\nvoid *producer(void *arg) {\n    (void)arg;\n    for (int i = 0; i < n; i++) {\n        pthread_mutex_lock(&mtx);\n        while (count == B) {\n            pthread_cond_wait(&not_full, &mtx);\n        }\n        buf[tail] = input_arr[i];\n        tail = (tail + 1) % B;\n        count++;\n        pthread_cond_signal(&not_empty);\n        pthread_mutex_unlock(&mtx);\n    }\n    return NULL;\n}\n\nvoid *consumer(void *arg) {\n    (void)arg;\n    for (int i = 1; i <= n; i++) {\n        pthread_mutex_lock(&mtx);\n        while (count == 0) {\n            pthread_cond_wait(&not_empty, &mtx);\n        }\n        int val = buf[head];\n        head = (head + 1) % B;\n        count--;\n        pthread_cond_signal(&not_full);\n        pthread_mutex_unlock(&mtx);\n\n        weighted_sum += (long long)i * val;\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d\", &B, &n);\n    input_arr = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &input_arr[i]);\n\n    pthread_t prod, cons;\n    pthread_create(&prod, NULL, producer, NULL);\n    pthread_create(&cons, NULL, consumer, NULL);\n\n    pthread_join(prod, NULL);\n    pthread_join(cons, NULL);\n\n    printf(\"%lld\\n\", weighted_sum);\n    free(input_arr);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Mảng vòng ring[64] chỉ xoay quanh đúng cap = B ô nhớ bằng phép chia lấy dư % cap.",
      "Consumer giải phóng khóa mutex ngay sau khi lấy phần tử ra khỏi hàng đợi rồi mới nhân cộng vào biến cục bộ acc để giảm thời gian giữ khóa."
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
        "pthread_cond_wait",
        "pthread_cond_signal"
      ],
      "forbiddenApis": [
        "sleep",
        "usleep"
      ],
      "qualityRules": [
        {
          "desc": "Cập nhật chỉ số hàng đợi vòng bằng phép modulo % B",
          "regex": "%\\s*\\w+",
          "flags": ""
        },
        {
          "desc": "Kiểm tra đầy/rỗng bằng vòng lặp while quanh pthread_cond_wait()",
          "regex": "while\\s*\\([\\s\\S]{1,140}?pthread_cond_wait",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 4 — Mô hình Producer-Consumer kinh điển với hàng đợi vòng dung lượng giới hạn B và 2 Biến điều kiện (Mục 4.10 · Lab 4 Bài 7 · Đề cuối kỳ).",
      "idea": {
        "summary": "Bài toán mô phỏng hệ thống sản xuất – tiêu thụ (Producer-Consumer) gồm 1 luồng Producer đẩy tuần tự n số nguyên vào một bộ đệm vòng (Circular Buffer) có sức chứa tối đa đúng B phần tử, và 1 luồng Consumer rút đủ n phần tử theo đúng thứ tự vào trước ra trước (FIFO) để tính tổng trọng số sum(i × val_i). Khi bộ đệm đầy (count == B), Producer phải tạm ngủ chờ; khi bộ đệm rỗng (count == 0), Consumer phải tạm ngủ chờ. Ta dùng 1 khóa Mutex kết hợp 2 Condition Variables riêng biệt (not_full và not_empty) để hai luồng phối hợp nhịp nhàng, không ghi đè mất dữ liệu và không đọc rác.",
        "steps": [
          "Bước 1 — Thiết kế bộ đệm vòng (Circular Queue) cỡ B: Dùng mảng buf[64] cùng 3 biến trạng thái head (vị trí đầu hàng đợi để Consumer rút ra), tail (vị trí cuối hàng đợi để Producer nhét vào) và count (số phần tử đang nằm trong đệm, luôn thỏa 0 <= count <= B).",
          "Bước 2 — Thiết lập đồng bộ với 1 Mutex + 2 CondVars: Khóa mtx bảo vệ mọi thao tác lên buf, head, tail, count. Biến điều kiện not_full là nơi Producer ngủ khi đệm đầy; not_empty là nơi Consumer ngủ khi đệm rỗng.",
          "Bước 3 — Vòng lặp Producer đẩy n phần tử: Với mỗi input_arr[i], khóa mtx → ngủ trong while (count == B) wait(&not_full, &mtx) → ghi buf[tail], xoay vòng tail = (tail + 1) % B, tăng count++ → gọi signal(&not_empty) báo cho Consumer → mở khóa mtx.",
          "Bước 4 — Vòng lặp Consumer rút n phần tử theo thứ tự FIFO: Với lượt i = 1..n, khóa mtx → ngủ trong while (count == 0) wait(&not_empty, &mtx) → đọc val = buf[head], xoay vòng head = (head + 1) % B, giảm count-- → gọi signal(&not_full) báo cho Producer → mở khóa mtx → cộng (long long)i * val vào weighted_sum ngoài miền găng.",
          "Bước 5 — Tổng hợp ở main(): Đọc B, n và mảng đầu vào, khởi chạy song song prod và cons, gọi pthread_join cả hai rồi in weighted_sum và free(input_arr)."
        ],
        "whyThisWay": "Tại sao phải dùng hàng đợi vòng thay vì mảng dịch chuyển phần tử? Vì xoay chỉ số bằng phép modulo (tail + 1) % B và (head + 1) % B giúp thao tác thêm/xóa luôn đạt O(1) mà chỉ tốn đúng B ô nhớ cố định! Tại sao nên tách 2 Condition Variables (not_full và not_empty) thay vì gộp chung 1 biến? Vì mỗi nhóm chờ một sự kiện khác nhau: Producer chỉ muốn thức dậy khi có ô trống (not_full), Consumer chỉ muốn thức dậy khi có hàng mới (not_empty) — tách riêng giúp báo hiệu trúng đích, tránh đánh thức nhầm và dễ mở rộng sang nhiều Producer/Consumer.",
        "complexity": "Thời gian: O(n) · Bộ nhớ: O(n + B) (mảng input_arr cỡ n + bộ đệm vòng cố định 64 int) · Tài nguyên: 2 luồng POSIX + 1 Mutex + 2 Condition Variables"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện chuẩn và POSIX Threads",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>",
          "explain": "<stdio.h> dùng cho nhập xuất, <stdlib.h> dùng cho malloc/free mảng input_arr, và <pthread.h> dùng cho luồng, Mutex và Condition Variables."
        },
        {
          "lines": "Dòng 5–13",
          "title": "Khai báo bộ đệm vòng, biến kết quả và 3 đối tượng đồng bộ",
          "code": "int B, n;\nint *input_arr;\nint buf[64];\nint head = 0, tail = 0, count = 0;\nlong long weighted_sum = 0;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t not_full = PTHREAD_COND_INITIALIZER;\npthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;",
          "explain": "buf[64] đủ chứa sức chứa tối đa B <= 64 (và trong logic ta luôn xoay vòng theo đúng modulo B chứ không phải 64!). Ba biến head, tail, count định nghĩa chính xác hàng đợi vòng: count == 0 là rỗng, count == B là đầy. weighted_sum dùng long long vì với n = 10^4 và |x_i| = 10^4, tổng trọng số có thể lên tới ~5 × 10^11 (vượt xa ngưỡng int 32-bit). Hai biến điều kiện not_full và not_empty được khởi tạo tĩnh rõ ràng theo đúng ngữ nghĩa điều kiện chờ."
        },
        {
          "lines": "Dòng 15–29",
          "title": "Luồng Producer — Chờ khi đầy, ghi vào tail và báo not_empty",
          "code": "void *producer(void *arg) {\n    (void)arg;\n    for (int i = 0; i < n; i++) {\n        pthread_mutex_lock(&mtx);\n        while (count == B) pthread_cond_wait(&not_full, &mtx);\n        buf[tail] = input_arr[i];\n        tail = (tail + 1) % B;\n        count++;\n        pthread_cond_signal(&not_empty);\n        pthread_mutex_unlock(&mtx);\n    }\n    return NULL;\n}",
          "explain": "Producer duyệt đủ n phần tử đầu vào. Trước khi chạm vào buf hay count, nó khóa mtx. Nếu count == B (đệm đã đầy cứng), nó ngủ trên not_full bên trong vòng while (chống spurious wakeup và đảm bảo sau khi tỉnh dậy thực sự có chỗ trống). Khi có chỗ, nó đặt phần tử vào buf[tail], tịnh tiến vòng tail = (tail + 1) % B (khi tail chạm B - 1 sẽ quay về 0), tăng count++, rồi gọi pthread_cond_signal(&not_empty) để đánh thức Consumer nếu Consumer đang ngủ chờ hàng, cuối cùng nhả mtx."
        },
        {
          "lines": "Dòng 31–47",
          "title": "Luồng Consumer — Chờ khi rỗng, rút ở head và tính tổng trọng số",
          "code": "void *consumer(void *arg) {\n    (void)arg;\n    for (int i = 1; i <= n; i++) {\n        pthread_mutex_lock(&mtx);\n        while (count == 0) pthread_cond_wait(&not_empty, &mtx);\n        int val = buf[head];\n        head = (head + 1) % B;\n        count--;\n        pthread_cond_signal(&not_full);\n        pthread_mutex_unlock(&mtx);\n        weighted_sum += (long long)i * val;\n    }\n    return NULL;\n}",
          "explain": "Consumer lặp i từ 1 đến n (đúng chỉ số trọng số 1-based theo đề bài). Khi đệm rỗng (count == 0), Consumer ngủ trên not_empty. Khi có hàng, nó rút phần tử ở đầu hàng đợi buf[head] (bảo toàn 100% thứ tự FIFO), xoay vòng head = (head + 1) % B, giảm count--, gọi signal(&not_full) báo cho Producer biết vừa có thêm 1 ô trống, rồi mở khóa mtx. Mẹo tối ưu quan trọng: phép tính weighted_sum += (long long)i * val; được đưa ra NGOÀI miền găng để rút ngắn thời gian giữ khóa; đồng thời ép kiểu (long long)i TRƯỚC khi nhân với val để tránh tràn int ở phép nhân trung gian."
        },
        {
          "lines": "Dòng 49–59",
          "title": "Đọc đầu vào, khởi tạo và đồng bộ Producer cùng Consumer",
          "code": "scanf(\"%d %d\", &B, &n);\ninput_arr = (int *)malloc(n * sizeof(int));\nfor (int i = 0; i < n; i++) scanf(\"%d\", &input_arr[i]);\npthread_t prod, cons;\npthread_create(&prod, NULL, producer, NULL);\npthread_create(&cons, NULL, consumer, NULL);\npthread_join(prod, NULL);\npthread_join(cons, NULL);",
          "explain": "Đọc dung lượng B, số phần tử n và mảng input_arr. Khởi chạy đồng thời luồng prod và luồng cons rồi chờ cả hai kết thúc bằng pthread_join. Do số phần tử Producer đẩy vào (n) bằng đúng số phần tử Consumer rút ra (n), cả hai luồng đều kết thúc vòng lặp tự nhiên không bao giờ bị treo."
        },
        {
          "lines": "Dòng 61–64",
          "title": "In tổng trọng số và giải phóng bộ nhớ",
          "code": "printf(\"%lld\\n\", weighted_sum);\nfree(input_arr);\nreturn 0;",
          "explain": "Sau khi cả hai luồng kết thúc, in weighted_sum bằng %lld, gọi free(input_arr) giải phóng mảng động và kết thúc với mã 0."
        }
      ],
      "testCases": [
        {
          "name": "Sức chứa nhỏ hơn n buộc xoay vòng nhiều lần",
          "caseDesc": "B = 2, n = 4, x = [10, 20, 30, 40]",
          "howHandled": "Producer liên tục gặp count == 2 và ngủ trên not_full; Consumer lấy đúng thứ tự 10, 20, 30, 40 → 1×10 + 2×20 + 3×30 + 4×40 = 300."
        },
        {
          "name": "Biên sức chứa cực tiểu B = 1 (đồng bộ từng phần tử một)",
          "caseDesc": "B = 1, n = 5, x = [5, -3, 2, -1, 4]",
          "howHandled": "Với B = 1, tail = (0 + 1) % 1 = 0 và head = (0 + 1) % 1 = 0 luôn hoạt động đúng; Producer và Consumer xen kẽ từng bước một không bị Deadlock → tổng = 5 - 6 + 6 - 4 + 20 = 21."
        },
        {
          "name": "Sức chứa B lớn hơn n (đệm không bao giờ đầy)",
          "caseDesc": "B = 64, n = 3, x = [-100, 0, 100]",
          "howHandled": "Producer đẩy một mạch cả 3 số vào buf[0..2] rồi kết thúc; Consumer vẫn rút đủ 3 số theo FIFO → 1×(-100) + 2×0 + 3×100 = 200."
        },
        {
          "name": "Biên lớn chống tràn số nguyên 32-bit",
          "caseDesc": "B = 8, n = 10000, x_i = 10000 với mọi i",
          "howHandled": "Tổng trọng số = 10000 × (10000 × 10001 / 2) ≈ 5 × 10^11 vượt xa INT_MAX; nhờ ép kiểu (long long)i * val và weighted_sum kiểu long long, kết quả chính xác 100%."
        }
      ],
      "examRecipe": [
        "Khai báo buf[64], head = 0, tail = 0, count = 0, mtx, not_full, not_empty và long long weighted_sum = 0;.",
        "Trong producer: lặp n lần → lock → while (count == B) wait(&not_full, &mtx) → buf[tail] = x[i]; tail = (tail + 1) % B; count++; → signal(&not_empty) → unlock.",
        "Trong consumer: lặp i = 1..n → lock → while (count == 0) wait(&not_empty, &mtx) → val = buf[head]; head = (head + 1) % B; count--; → signal(&not_full) → unlock.",
        "Cộng dồn weighted_sum += (long long)i * val; (nhớ ép long long trước khi nhân!).",
        "Trong main(): đọc B, n, mảng đầu vào → create prod & cons → join cả hai → in %lld → free mảng."
      ]
    }
  },
  {
    "num": 23,
    "id": "CR-23",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Khó",
    "title": "Mô hình nhiều Producer - nhiều Consumer kết thúc an toàn không Deadlock",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_mutex_t và pthread_cond_t",
    "prompt": "Cho P luồng Producer, C luồng Consumer, dung lượng hàng đợi vòng B và mảng gồm n số nguyên. Chia đều n phần tử cho P Producer đưa vào bộ đệm dùng chung; C Consumer đồng thời rút phần tử từ bộ đệm, nếu số lấy ra là số chẵn thì cộng dồn vào tổng chung even_sum (có đồng bộ). Bạn cần thiết kế cơ chế báo hiệu kết thúc sạch sẽ (dùng biến đếm số phần tử còn lại hoặc số Producer còn hoạt động kết hợp pthread_cond_broadcast) để mọi Consumer đều tự thoát đúng lúc sau khi hết dữ liệu mà không rơi vào trạng thái treo chờ vĩnh viễn.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_mutex_t, pthread_cond_t và cơ chế kết thúc an toàn cho cả P Producer lẫn C Consumer.",
      "Lưu ý trong C phép kiểm tra chẵn là (val % 2 == 0), hoạt động đúng cả với số âm chẵn."
    ],
    "inputSpec": "Dòng 1: bốn số nguyên P C B n. Dòng 2: n số nguyên a_0, ..., a_{n-1}.",
    "outputSpec": "Một số nguyên (long long) là tổng các phần tử chẵn trong mảng.",
    "constraints": [
      "1 <= P, C <= 8",
      "1 <= B <= 32",
      "1 <= n <= 10^4",
      "-10^6 <= a_i <= 10^6"
    ],
    "example": {
      "note": "Các số chẵn trong [4, 7, -2, 5, 8, 0] là 4 + (-2) + 8 + 0 = 10.",
      "input": "2 3 2 6\n4 7 -2 5 8 0",
      "output": "10"
    },
    "relatedTopics": [
      {
        "id": "4-10",
        "label": "4.10 Kết thúc sạch Đa Producer – Đa Consumer với pthread_cond_broadcast()"
      },
      {
        "id": "4-11",
        "label": "4.11 Phòng chống Deadlock khi các luồng chờ điều kiện kết thúc"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khi Producer cuối cùng kết thúc (active_producers giảm về 0), có thể có nhiều Consumer đang ngủ trên not_empty! Nếu chỉ gọi signal thay vì pthread_cond_broadcast(&not_empty), chỉ 1 Consumer tỉnh dậy rồi thoát, bỏ mặc các Consumer còn lại ngủ treo mãi mãi (Deadlock)!",
    "relatedQuestions": [
      "CR-21",
      "CR-22",
      "CR-24"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\nint P, C, B, n;\nint *a;\nint buf[64];\nint head = 0, tail = 0, count = 0;\nint active_producers = 0;\nlong long even_sum = 0;\n\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t not_full = PTHREAD_COND_INITIALIZER;\npthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;\n\ntypedef struct {\n    int left, right;\n} Range;\n\nvoid *producer(void *arg) {\n    Range *r = (Range *)arg;\n    for (int i = r->left; i < r->right; i++) {\n        pthread_mutex_lock(&mtx);\n        while (count == B) {\n            pthread_cond_wait(&not_full, &mtx);\n        }\n        buf[tail] = a[i];\n        tail = (tail + 1) % B;\n        count++;\n        pthread_cond_signal(&not_empty);\n        pthread_mutex_unlock(&mtx);\n    }\n\n    pthread_mutex_lock(&mtx);\n    active_producers--;\n    if (active_producers == 0) {\n        pthread_cond_broadcast(&not_empty);\n    }\n    pthread_mutex_unlock(&mtx);\n    return NULL;\n}\n\nvoid *consumer(void *arg) {\n    (void)arg;\n    long long local_even = 0;\n    while (1) {\n        pthread_mutex_lock(&mtx);\n        while (count == 0 && active_producers > 0) {\n            pthread_cond_wait(&not_empty, &mtx);\n        }\n        if (count == 0 && active_producers == 0) {\n            pthread_mutex_unlock(&mtx);\n            break;\n        }\n        int val = buf[head];\n        head = (head + 1) % B;\n        count--;\n        pthread_cond_signal(&not_full);\n        pthread_mutex_unlock(&mtx);\n\n        if (val % 2 == 0) local_even += val;\n    }\n\n    pthread_mutex_lock(&mtx);\n    even_sum += local_even;\n    pthread_mutex_unlock(&mtx);\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d %d %d\", &P, &C, &B, &n);\n    a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    active_producers = P;\n    pthread_t prod[16], cons[16];\n    Range ranges[16];\n\n    int base = n / P, rem = n % P;\n    for (int i = 0; i < P; i++) {\n        ranges[i].left = i * base + (i < rem ? i : rem);\n        ranges[i].right = ranges[i].left + base + (i < rem ? 1 : 0);\n        pthread_create(&prod[i], NULL, producer, &ranges[i]);\n    }\n    for (int i = 0; i < C; i++) {\n        pthread_create(&cons[i], NULL, consumer, NULL);\n    }\n\n    for (int i = 0; i < P; i++) pthread_join(prod[i], NULL);\n    for (int i = 0; i < C; i++) pthread_join(cons[i], NULL);\n\n    printf(\"%lld\\n\", even_sum);\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Điều kiện ngủ chờ while (count == 0 && active_producers > 0) kết hợp với pthread_cond_broadcast(&not_empty) khi active_producers == 0 đảm bảo không Consumer nào bị kẹt lại sau khi hết dữ liệu.",
      "Mỗi Consumer cộng dồn số chẵn vào biến cục bộ local_even rồi chỉ cộng 1 lần vào even_sum dưới khóa mutex khi kết thúc."
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
        "pthread_cond_wait",
        "pthread_cond_broadcast"
      ],
      "forbiddenApis": [
        "sleep",
        "usleep"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra số chẵn bằng % 2 == 0 (đúng cho cả số nguyên âm)",
          "regex": "%\\s*2\\s*==\\s*0",
          "flags": ""
        },
        {
          "desc": "Gọi pthread_cond_broadcast() đánh thức toàn bộ Consumer khi kết thúc",
          "regex": "pthread_cond_broadcast",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Kiểm tra chẵn lẻ bằng val % 2 == 1 sẽ SAI với số âm lẻ trong C (vì -3 % 2 == -1)!",
          "regex": "%\\s*2\\s*==\\s*1",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 4 — Mô hình Nhiều Producer – Nhiều Consumer (MPMC) với cơ chế kết thúc an toàn không Deadlock bằng active_producers và pthread_cond_broadcast() (Mục 4.10).",
      "idea": {
        "summary": "Mở rộng từ bài Producer-Consumer cơ bản, bài toán có đồng thời P luồng Producer (chia nhau đẩy n phần tử mảng vào bộ đệm vòng dung lượng B) và C luồng Consumer (cùng tranh nhau rút phần tử, kiểm tra nếu là số chẵn thì cộng vào tổng even_sum). Thách thức lớn nhất của mô hình MPMC là: mỗi Consumer KHÔNG biết trước mình sẽ nhận bao nhiêu phần tử! Do đó ta phải dùng biến đếm active_producers (khởi tạo bằng P trước khi tạo luồng): mỗi Producer xong việc sẽ giảm active_producers đi 1, và Producer cuối cùng gọi pthread_cond_broadcast(&not_empty) để đánh thức toàn bộ Consumer đang ngủ biết rằng sẽ không bao giờ có thêm hàng nữa để tự thoát vòng lặp sạch sẽ.",
        "steps": [
          "Bước 1 — Khởi tạo trạng thái MPMC: Khai báo bộ đệm vòng buf[64] (head, tail, count), biến active_producers = P (PHẢI gán trước khi tạo bất kỳ luồng nào), tổng even_sum = 0, khóa mtx, hai biến điều kiện not_full, not_empty và struct Range { left, right }.",
          "Bước 2 — Chia đều mảng cho P Producer: Áp dụng công thức base = n / P, rem = n % P gán đoạn [left, right) riêng vào ranges[0..P-1] rồi khởi tạo P luồng Producer và C luồng Consumer.",
          "Bước 3 — Producer đẩy hàng và báo hiệu khi giải nghệ: Mỗi Producer đẩy hết đoạn [left, right) của mình vào hàng đợi (chờ trên not_full khi count == B, báo signal(&not_empty) mỗi khi đẩy xong). Khi hết vòng lặp, Producer khóa mtx, giảm active_producers--; nếu active_producers == 0 thì gọi pthread_cond_broadcast(&not_empty) đánh thức TẤT CẢ Consumer.",
          "Bước 4 — Consumer chờ kép và thoát sạch không bỏ sót hàng: Trong vòng while (1), Consumer khóa mtx rồi chờ trong while (count == 0 && active_producers > 0) wait(&not_empty, &mtx);. Khi thoát while, nếu count == 0 && active_producers == 0 thì lập tức mở khóa mtx rồi break! Nếu count > 0 (kể cả khi active_producers == 0), Consumer vẫn tiếp tục rút cho cạn sạch hàng còn tồn trong đệm.",
          "Bước 5 — Tích lũy cục bộ rồi gộp kết quả (giảm tranh chấp khóa): Mỗi Consumer cộng các số chẵn (val % 2 == 0) vào biến cục bộ local_even ngoài miền găng; khi kết thúc mới khóa mtx đúng 1 lần để cộng even_sum += local_even. Cuối cùng main join đủ P + C luồng và in even_sum."
        ],
        "whyThisWay": "Có 3 cái bẫy Deadlock chết người nếu viết MPMC theo cảm tính: (1) Nếu Producer cuối cùng chỉ gọi pthread_cond_signal(&not_empty) thay vì broadcast, khi có C = 8 Consumer đang ngủ thì chỉ 1 luồng tỉnh dậy thoát, 7 luồng còn lại ngủ vĩnh viễn! (2) Nếu Consumer kiểm tra if (active_producers == 0) break; mà quên kiểm tra count == 0, nó sẽ thoát sớm và bỏ sót những phần tử cuối đang nằm trong hàng đợi! (3) Nếu Consumer quên gọi pthread_mutex_unlock(&mtx) trước lệnh break, toàn bộ các Consumer khác muốn kiểm tra thoát sẽ bị chặn vĩnh viễn ở dòng lock(&mtx). Cơ chế kết hợp active_producers + điều kiện kép (count == 0 && active_producers == 0) + broadcast giải quyết trọn vẹn cả 3 bẫy này.",
        "complexity": "Thời gian: O(n) · Bộ nhớ: O(n + B) (mảng a + đệm vòng 64 int + mảng quản lý luồng) · Tài nguyên: (P + C) luồng POSIX + 1 Mutex + 2 Condition Variables"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện chuẩn và POSIX Threads",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>",
          "explain": "Nạp <stdio.h> cho nhập xuất, <stdlib.h> cho malloc/free mảng a, và <pthread.h> cho mô hình đa luồng Producer-Consumer."
        },
        {
          "lines": "Dòng 5–18",
          "title": "Khai báo bộ đệm vòng, active_producers, đồng bộ và struct Range",
          "code": "int P, C, B, n;\nint *a;\nint buf[64];\nint head = 0, tail = 0, count = 0;\nint active_producers = 0;\nlong long even_sum = 0;\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\npthread_cond_t not_full = PTHREAD_COND_INITIALIZER;\npthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;\ntypedef struct { int left, right; } Range;",
          "explain": "Tương tự CR-22 nhưng bổ sung thêm active_producers (đếm số luồng Producer chưa kết thúc) và struct Range để giao cho mỗi Producer một đoạn chỉ số [left, right) riêng biệt. even_sum dùng long long vì với n = 10^4 và |a_i| = 10^6, tổng có thể lên tới ±10^10 vượt quá kiểu int 32-bit."
        },
        {
          "lines": "Dòng 20–32",
          "title": "Vòng lặp sản xuất của mỗi Producer",
          "code": "void *producer(void *arg) {\n    Range *r = (Range *)arg;\n    for (int i = r->left; i < r->right; i++) {\n        pthread_mutex_lock(&mtx);\n        while (count == B) pthread_cond_wait(&not_full, &mtx);\n        buf[tail] = a[i];\n        tail = (tail + 1) % B;\n        count++;\n        pthread_cond_signal(&not_empty);\n        pthread_mutex_unlock(&mtx);\n    }",
          "explain": "Ép void *arg về Range *r để lấy đoạn dữ liệu riêng của Producer này. Nếu P > n, một số Producer có r->left == r->right nên vòng for không chạy lần nào và nhảy thẳng xuống bước giảm active_producers ở dòng 34 — xử lý rất tự nhiên! Mỗi khi đẩy xong 1 phần tử vào đệm vòng, Producer gọi signal(&not_empty) đánh thức một Consumer đang chờ (chỉ cần signal vì vừa thêm đúng 1 phần tử)."
        },
        {
          "lines": "Dòng 34–41",
          "title": "Thủ tục kết thúc Producer và phát tín hiệu broadcast()",
          "code": "    pthread_mutex_lock(&mtx);\n    active_producers--;\n    if (active_producers == 0) {\n        pthread_cond_broadcast(&not_empty);\n    }\n    pthread_mutex_unlock(&mtx);\n    return NULL;\n}",
          "explain": "Khi Producer đã đẩy xong toàn bộ phần tử được giao, nó khóa mtx để giảm active_producers-- an toàn khỏi race condition. Nếu nó là Producer cuối cùng hoàn thành (active_producers == 0), nó gọi pthread_cond_broadcast(&not_empty) để đánh thức TẤT CẢ các Consumer đang ngủ trên not_empty. Tại sao bắt buộc broadcast? Vì có thể đang có tới C Consumer cùng ngủ — signal chỉ cứu được 1 luồng còn các luồng khác sẽ kẹt Deadlock vĩnh viễn!"
        },
        {
          "lines": "Dòng 43–54",
          "title": "Consumer chờ điều kiện kép và kiểm tra thoát sạch không Deadlock",
          "code": "void *consumer(void *arg) {\n    (void)arg;\n    long long local_even = 0;\n    while (1) {\n        pthread_mutex_lock(&mtx);\n        while (count == 0 && active_producers > 0) {\n            pthread_cond_wait(&not_empty, &mtx);\n        }\n        if (count == 0 && active_producers == 0) {\n            pthread_mutex_unlock(&mtx);\n            break;\n        }",
          "explain": "Consumer chỉ đi ngủ khi đồng thời CẢ HAI điều kiện xảy ra: hàng đợi đang rỗng (count == 0) VÀ vẫn còn ít nhất 1 Producer đang sống (active_producers > 0) có khả năng sinh thêm hàng. Ngay khi tỉnh dậy và thoát vòng while, ta gặp 2 tình huống: (1) count == 0 && active_producers == 0 (hàng đã cạn sạch và không còn ai sản xuất nữa) → BẮT BUỘC gọi pthread_mutex_unlock(&mtx) trước khi break để không khóa chết các luồng khác; (2) count > 0 → tiếp tục đi xuống rút hàng (kể cả khi mọi Producer đã nghỉ, vẫn phải dọn sạch hàng tồn trong đệm)."
        },
        {
          "lines": "Dòng 55–68",
          "title": "Rút phần tử, kiểm tra số chẵn (kể cả số âm) và gộp tổng cục bộ",
          "code": "        int val = buf[head];\n        head = (head + 1) % B;\n        count--;\n        pthread_cond_signal(&not_full);\n        pthread_mutex_unlock(&mtx);\n        if (val % 2 == 0) local_even += val;\n    }\n    pthread_mutex_lock(&mtx);\n    even_sum += local_even;\n    pthread_mutex_unlock(&mtx);\n    return NULL;\n}",
          "explain": "Rút val từ buf[head], xoay vòng head, giảm count--, báo signal(&not_full) cho các Producer đang chờ ô trống rồi nhả khóa ngay lập tức. Phép kiểm tra (val % 2 == 0) trong C hoạt động chuẩn cho cả số âm chẵn lẫn số 0 (ví dụ (-4) % 2 == 0; ngược lại viết val % 2 == 1 để kiểm tra lẻ sẽ sai với -3 vì (-3) % 2 == -1!). Cộng vào biến cục bộ local_even giúp giảm hàng nghìn lần khóa/mở mtx; khi thoát vòng lặp, mỗi Consumer chỉ cần khóa mtx đúng 1 lần để cộng gộp vào even_sum."
        },
        {
          "lines": "Dòng 70–87",
          "title": "Khởi tạo active_producers = P trước khi tạo luồng và phân chia công việc",
          "code": "scanf(\"%d %d %d %d\", &P, &C, &B, &n);\na = (int *)malloc(n * sizeof(int));\nfor (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\nactive_producers = P;\npthread_t prod[16], cons[16];\nRange ranges[16];\nint base = n / P, rem = n % P;\nfor (int i = 0; i < P; i++) { ... pthread_create(&prod[i], ...); }\nfor (int i = 0; i < C; i++) pthread_create(&cons[i], NULL, consumer, NULL);",
          "explain": "CHI TIẾT CỰC KỲ QUAN TRỌNG: dòng active_producers = P; PHẢI đặt trước mọi lệnh pthread_create! Nếu bạn để từng Producer tự tăng active_producers++ bên trong hàm luồng, một Consumer chạy quá nhanh có thể kiểm tra trước khi Producer nào kịp chạy, thấy count == 0 && active_producers == 0 rồi tự thoát sớm! Mảng ranges[16] cấp cho mỗi Producer đoạn [left, right) riêng, rồi khởi chạy song song P Producer và C Consumer."
        },
        {
          "lines": "Dòng 89–95",
          "title": "Chờ toàn bộ Producer & Consumer kết thúc, in even_sum và dọn dẹp",
          "code": "for (int i = 0; i < P; i++) pthread_join(prod[i], NULL);\nfor (int i = 0; i < C; i++) pthread_join(cons[i], NULL);\nprintf(\"%lld\\n\", even_sum);\nfree(a);\nreturn 0;",
          "explain": "Gọi pthread_join chờ đủ P Producer và C Consumer hoàn tất 100%, đảm bảo mọi biến local_even đều đã được cộng vào even_sum. In kết quả bằng %lld và gọi free(a)."
        }
      ],
      "testCases": [
        {
          "name": "Nhiều Producer và nhiều Consumer với số âm chẵn",
          "caseDesc": "P = 3, C = 4, B = 2, n = 6, a = [-4, -3, 0, 7, 10, -2]",
          "howHandled": "Các số chẵn là -4, 0, 10, -2 (đều thỏa val % 2 == 0). Tổng chính xác = 4; toàn bộ 4 Consumer thoát sạch không treo."
        },
        {
          "name": "Số Producer lớn hơn số phần tử (P > n) và nhiều Consumer (C = 8)",
          "caseDesc": "P = 8, C = 8, B = 1, n = 2, a = [100, 200]",
          "howHandled": "6 Producer có đoạn rỗng [left, right) lập tức giảm active_producers; 2 Producer còn lại đẩy 100 và 200. Khi active_producers về 0, broadcast đánh thức tất cả Consumer đang ngủ → in 300 không Deadlock."
        },
        {
          "name": "Không có số chẵn nào trong mảng",
          "caseDesc": "P = 2, C = 3, B = 4, n = 5, a = [-9, -1, 1, 3, 5]",
          "howHandled": "Mọi Consumer có local_even = 0 → even_sum = 0."
        },
        {
          "name": "Tranh chấp cực cao và tổng vượt int 32-bit",
          "caseDesc": "P = 8, C = 8, B = 1, n = 10000, tất cả a[i] = 1000000",
          "howHandled": "Bộ đệm cỡ 1 liên tục đầy/rỗng giữa 16 luồng; không mất phần tử, không Deadlock và even_sum = 10^10 tính chính xác nhờ long long."
        }
      ],
      "examRecipe": [
        "Khai báo buf[64], head/tail/count = 0, active_producers = 0, long long even_sum = 0, mtx, not_full, not_empty, struct Range.",
        "Trong main(): GÁN active_producers = P TRƯỚC khi tạo bất kỳ luồng nào!",
        "Trong producer: đẩy xong đoạn [left, right) → lock → active_producers--; if (active_producers == 0) pthread_cond_broadcast(&not_empty); → unlock.",
        "Trong consumer: while (count == 0 && active_producers > 0) wait(&not_empty, &mtx); → nếu (count == 0 && active_producers == 0) thì unlock(&mtx) rồi break!.",
        "Rút hàng, signal(&not_full), unlock, kiểm tra (val % 2 == 0) cộng vào local_even; cuối hàm lock 1 lần cộng vào even_sum.",
        "Join đủ P Producer và C Consumer, in %lld và free(a)."
      ]
    }
  },
  {
    "num": 24,
    "id": "CR-24",
    "part": "Thread",
    "partLabel": "Phần 3 · Lập trình Thread với POSIX Threads",
    "difficulty": "Khó",
    "title": "Chuyển khoản ngân hàng đa luồng chống Deadlock bằng thứ tự khóa",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh mảng pthread_mutex_t và pthread_create/pthread_join",
    "prompt": "Quản lý M tài khoản ngân hàng (đánh số 0..M-1) với số dư ban đầu bal[0..M-1]. Mỗi tài khoản phải gắn với một pthread_mutex_t riêng biệt. Cho Q giao dịch (u, v, amount) được phân phối cho T luồng thực hiện đồng thời: giao dịch chỉ hợp lệ khi 0 <= u < M, 0 <= v < M, u != v và amount > 0 (giao dịch không hợp lệ thì bỏ qua). Khi xử lý giao dịch hợp lệ, luồng phải khóa cả hai mutex của tài khoản u và v theo đúng thứ tự chỉ số tăng dần (min(u, v) trước, max(u, v) sau) để triệt tiêu nguy cơ Deadlock do khóa chéo, trừ amount ở u và cộng amount vào v.",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Mỗi tài khoản phải có một mutex riêng trong mảng acc_mtx[M] (không dùng một mutex tổng khóa toàn bộ ngân hàng).",
      "Bắt buộc áp dụng thứ tự khóa tăng dần min(u, v) trước max(u, v) và mở khóa đầy đủ.",
      "Cập nhật biến đếm số giao dịch hợp lệ an toàn khỏi race condition."
    ],
    "inputSpec": "Dòng 1: ba số nguyên M T Q. Dòng 2: M số nguyên là số dư ban đầu bal[0..M-1]. Q dòng tiếp theo: mỗi dòng gồm 3 số nguyên u v amount.",
    "outputSpec": "Dòng 1: số giao dịch hợp lệ đã thực hiện. Dòng 2: M số nguyên (long long) là số dư cuối cùng của các tài khoản 0..M-1, cách nhau 1 dấu cách.",
    "constraints": [
      "2 <= M <= 64",
      "1 <= T <= 8",
      "1 <= Q <= 5000",
      "0 <= bal[i] <= 10^9",
      "-10^6 <= amount <= 10^6"
    ],
    "example": {
      "note": "2 giao dịch đầu hợp lệ: (0->1: 50) và (1->0: 20); (2->2: 10) trùng tài khoản, (1->2: -5) tiền âm bị bỏ qua.",
      "input": "3 2 4\n100 200 300\n0 1 50\n1 0 20\n2 2 10\n1 2 -5",
      "output": "2\n70 230 300"
    },
    "relatedTopics": [
      {
        "id": "4-9",
        "label": "4.9 Khóa hạt mịn (Fine-grained Locking) trên mảng Mutex"
      },
      {
        "id": "4-11",
        "label": "4.11 Phá vỡ Circular Wait chống Deadlock bằng Lock Ordering"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Nếu Luồng 1 chuyển 0 -> 1 (khóa mtx[0] rồi chờ mtx[1]) cùng lúc Luồng 2 chuyển 1 -> 0 (khóa mtx[1] rồi chờ mtx[0]), hai luồng sẽ khóa chéo nhau vĩnh viễn! Quy tắc Lock Ordering (luôn khóa chỉ số nhỏ hơn trước, lớn hơn sau) phá vỡ điều kiện Circular Wait của Coffman, triệt tiêu 100% Deadlock.",
    "relatedQuestions": [
      "CR-18",
      "CR-23"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n\ntypedef struct {\n    int u, v;\n    long long amount;\n} Tx;\n\nint M, T, Q;\nlong long bal[64];\npthread_mutex_t acc_mtx[64];\npthread_mutex_t cnt_mtx = PTHREAD_MUTEX_INITIALIZER;\nTx *txs;\nint valid_count = 0;\n\ntypedef struct {\n    int left, right;\n} Range;\n\nvoid *worker(void *arg) {\n    Range *r = (Range *)arg;\n    int local_valid = 0;\n\n    for (int i = r->left; i < r->right; i++) {\n        int u = txs[i].u, v = txs[i].v;\n        long long amt = txs[i].amount;\n\n        if (u < 0 || u >= M || v < 0 || v >= M || u == v || amt <= 0) {\n            continue;\n        }\n\n        int first = (u < v) ? u : v;\n        int second = (u < v) ? v : u;\n\n        pthread_mutex_lock(&acc_mtx[first]);\n        pthread_mutex_lock(&acc_mtx[second]);\n\n        bal[u] -= amt;\n        bal[v] += amt;\n\n        pthread_mutex_unlock(&acc_mtx[second]);\n        pthread_mutex_unlock(&acc_mtx[first]);\n\n        local_valid++;\n    }\n\n    pthread_mutex_lock(&cnt_mtx);\n    valid_count += local_valid;\n    pthread_mutex_unlock(&cnt_mtx);\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d %d\", &M, &T, &Q);\n    for (int i = 0; i < M; i++) {\n        scanf(\"%lld\", &bal[i]);\n        pthread_mutex_init(&acc_mtx[i], NULL);\n    }\n\n    txs = (Tx *)malloc(Q * sizeof(Tx));\n    for (int i = 0; i < Q; i++) {\n        scanf(\"%d %d %lld\", &txs[i].u, &txs[i].v, &txs[i].amount);\n    }\n\n    pthread_t th[16];\n    Range ranges[16];\n    int base = Q / T, rem = Q % T;\n\n    for (int i = 0; i < T; i++) {\n        ranges[i].left = i * base + (i < rem ? i : rem);\n        ranges[i].right = ranges[i].left + base + (i < rem ? 1 : 0);\n        pthread_create(&th[i], NULL, worker, &ranges[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    printf(\"%d\\n\", valid_count);\n    for (int i = 0; i < M; i++) {\n        printf(\"%lld%s\", bal[i], (i == M - 1) ? \"\\n\" : \" \");\n    }\n\n    for (int i = 0; i < M; i++) pthread_mutex_destroy(&acc_mtx[i]);\n    free(txs);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Thứ tự khóa toàn cục first = min(u, v) rồi second = max(u, v) đảm bảo hai giao dịch ngược chiều (u -> v và v -> u) không bao giờ giữ chéo khóa của nhau.",
      "Mỗi luồng đếm số giao dịch hợp lệ vào trường riêng slices[i].valid_cnt nên không phát sinh tranh chấp khóa phụ trên biến đếm tổng."
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
          "desc": "Khai báo mảng pthread_mutex_t riêng cho từng tài khoản",
          "regex": "pthread_mutex_t\\s+\\w+\\s*\\[",
          "flags": ""
        },
        {
          "desc": "Áp dụng thứ tự khóa u < v (min trước, max sau) chống Deadlock",
          "regex": "u\\s*<\\s*v|v\\s*<\\s*u",
          "flags": ""
        },
        {
          "desc": "Kiểm tra đầy đủ giao dịch hợp lệ (u != v và amount > 0)",
          "regex": "u\\s*!=\\s*v|u\\s*==\\s*v",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 4 — Chống Deadlock (khóa chết) bằng quy tắc Thứ tự Khóa toàn cục (Lock Ordering) trên mảng Mutex hạt mịn (Mục 4.9 · Bài toán chuyển khoản & Triết gia ăn tối).",
      "idea": {
        "summary": "Bài toán mô phỏng hệ thống ngân hàng đa luồng quản lý M tài khoản, mỗi tài khoản có một khóa pthread_mutex_t riêng biệt (khóa hạt mịn — fine-grained locking) để các giao dịch trên các cặp tài khoản khác nhau vẫn chạy song song được. Khi một luồng thực hiện giao dịch hợp lệ chuyển amount từ u sang v, nó phải khóa đồng thời cả hai tài khoản u và v. Nếu khóa tùy tiện (u trước v sau), hai giao dịch ngược chiều (0 → 1) và (1 → 0) chạy đồng thời sẽ gây khóa chéo Deadlock vĩnh viễn! Giải pháp chuẩn mực là ép mọi luồng luôn khóa theo thứ tự chỉ số tăng dần: min(u, v) trước, max(u, v) sau — phá vỡ hoàn toàn điều kiện Chờ vòng tròn (Circular Wait).",
        "steps": [
          "Bước 1 — Khởi tạo mảng Mutex riêng từng tài khoản: Đọc M, T, Q và số dư ban đầu bal[0..M-1] (long long). Gọi pthread_mutex_init(&acc_mtx[i], NULL) cho từng tài khoản i = 0..M-1, đồng thời dùng một khóa riêng cnt_mtx cho biến đếm valid_count.",
          "Bước 2 — Chia đều Q giao dịch cho T luồng: Đọc mảng Q giao dịch (u, v, amount) vào bộ nhớ động txs. Chia thành T đoạn liên tiếp [left, right) qua struct Range và khởi tạo T luồng worker.",
          "Bước 3 — Lọc bỏ giao dịch không hợp lệ: Trong worker, bỏ qua ngay bằng continue nếu u hoặc v nằm ngoài [0, M - 1], hoặc u == v (tự chuyển cho mình — cực kỳ quan trọng vì nếu không lọc sẽ gây tự khóa chết Self-Deadlock!), hoặc amt <= 0.",
          "Bước 4 — Khóa theo thứ tự tăng dần và chuyển tiền nguyên tử: Tính first = min(u, v) và second = max(u, v). Khóa acc_mtx[first] trước, sau đó khóa acc_mtx[second]. Thực hiện bal[u] -= amt; bal[v] += amt; (chú ý vẫn trừ u, cộng v chứ không phải first/second!). Mở khóa acc_mtx[second] rồi acc_mtx[first] và tăng local_valid++.",
          "Bước 5 — Tổng hợp số giao dịch hợp lệ, in kết quả và dọn tài nguyên: Cuối hàm worker, khóa cnt_mtx đúng 1 lần để cộng valid_count += local_valid. Ở main(), join đủ T luồng, in valid_count và mảng bal[0..M-1], hủy toàn bộ M Mutex bằng pthread_mutex_destroy() và free(txs)."
        ],
        "whyThisWay": "Tại sao không dùng 1 khóa Mutex chung cho toàn ngân hàng? Vì khi có 64 tài khoản, giao dịch (0 → 1) và giao dịch (2 → 3) hoàn toàn không đụng nhau — khóa 1 mutex tổng sẽ làm tắc nghẽn toàn bộ hệ thống và vi phạm yêu cầu đề bài. Tuy nhiên, khi dùng mảng khóa hạt mịn acc_mtx[M], ta đối mặt với 4 điều kiện Coffman gây Deadlock: Luồng A giữ khóa 0 đòi khóa 1, đồng thời Luồng B giữ khóa 1 đòi khóa 0 → cả hai treo vĩnh viễn (giống hệt bài toán 5 Triết gia ăn tối — Dining Philosophers). Quy tắc Lock Ordering (luôn khóa chỉ số nhỏ trước chỉ số lớn) biến đồ thị chờ đợi thành đồ thị có hướng không chu trình (DAG), chứng minh toán học rằng Deadlock không bao giờ có thể xảy ra!",
        "complexity": "Thời gian: O(Q) (chạy song song trên các cặp tài khoản không giao nhau) · Bộ nhớ: O(Q + M) (mảng giao dịch txs + 64 tài khoản và 64 Mutex) · Tài nguyên: T luồng POSIX + (M + 1) Mutex"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–8",
          "title": "Khai báo thư viện và cấu trúc giao dịch Tx",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\ntypedef struct {\n    int u, v;\n    long long amount;\n} Tx;",
          "explain": "Nạp thư viện chuẩn và POSIX Threads. Cấu trúc Tx lưu gọn một lệnh chuyển khoản gồm tài khoản nguồn u, tài khoản đích v và số tiền amount kiểu long long."
        },
        {
          "lines": "Dòng 10–19",
          "title": "Khai báo mảng số dư, mảng Mutex từng tài khoản và struct Range",
          "code": "int M, T, Q;\nlong long bal[64];\npthread_mutex_t acc_mtx[64];\npthread_mutex_t cnt_mtx = PTHREAD_MUTEX_INITIALIZER;\nTx *txs;\nint valid_count = 0;\ntypedef struct { int left, right; } Range;",
          "explain": "Mỗi tài khoản i (0 <= i < M <= 64) có số dư bal[i] (kiểu long long để chứa số dư ban đầu 10^9 cộng dồn qua hàng nghìn giao dịch tới 5 × 10^9 mà không tràn int) đi kèm đúng 1 khóa riêng acc_mtx[i]. Biến cnt_mtx được tách riêng để bảo vệ biến đếm valid_count, tránh lẫn lộn với khóa tài khoản."
        },
        {
          "lines": "Dòng 21–31",
          "title": "Hàm luồng worker và bộ lọc loại bỏ giao dịch không hợp lệ",
          "code": "void *worker(void *arg) {\n    Range *r = (Range *)arg;\n    int local_valid = 0;\n    for (int i = r->left; i < r->right; i++) {\n        int u = txs[i].u, v = txs[i].v;\n        long long amt = txs[i].amount;\n        if (u < 0 || u >= M || v < 0 || v >= M || u == v || amt <= 0) continue;",
          "explain": "Mỗi luồng duyệt các giao dịch trong đoạn [r->left, r->right) của mình và dùng biến cục bộ local_valid để đếm số giao dịch thành công. Điều kiện lọc kiểm tra đủ 4 lỗi: chỉ số u ngoài [0, M-1], chỉ số v ngoài [0, M-1], u == v, hoặc amt <= 0. Lưu ý tối quan trọng: kiểm tra u == v không chỉ đúng nghiệp vụ mà còn ngăn chặn lỗi Self-Deadlock — nếu u == v mà đi khóa acc_mtx[first] rồi lại khóa tiếp acc_mtx[second] (cùng một khóa!), luồng sẽ tự khóa chết chính mình vì Mutex mặc định của POSIX không hỗ trợ khóa đệ quy!"
        },
        {
          "lines": "Dòng 33–46",
          "title": "Quy tắc Thứ tự Khóa (Lock Ordering) chống Deadlock và chuyển tiền",
          "code": "        int first = (u < v) ? u : v;\n        int second = (u < v) ? v : u;\n        pthread_mutex_lock(&acc_mtx[first]);\n        pthread_mutex_lock(&acc_mtx[second]);\n        bal[u] -= amt;\n        bal[v] += amt;\n        pthread_mutex_unlock(&acc_mtx[second]);\n        pthread_mutex_unlock(&acc_mtx[first]);\n        local_valid++;\n    }",
          "explain": "Đây là lõi thuật toán chống Deadlock: với mọi cặp (u, v), luôn tính first = min(u, v) và second = max(u, v), rồi khóa acc_mtx[first] trước, acc_mtx[second] sau. Khi Luồng 1 chuyển (0 → 1) và Luồng 2 chuyển (1 → 0), CẢ HAI đều cố lấy acc_mtx[0] trước rồi mới lấy acc_mtx[1] — không bao giờ xảy ra vòng lặp chờ chéo! LƯU Ý BẪY DỄ NHẦM: bên trong miền găng vẫn PHẢI trừ ở tài khoản nguồn u (bal[u] -= amt) và cộng vào tài khoản đích v (bal[v] += amt), tuyệt đối KHÔNG viết nhầm thành bal[first] -= amt! Mở khóa theo thứ tự ngược lại (second trước, first sau) là chuẩn thực hành tốt cho khóa lồng nhau."
        },
        {
          "lines": "Dòng 48–52",
          "title": "Cộng gộp số giao dịch hợp lệ an toàn vào valid_count",
          "code": "    pthread_mutex_lock(&cnt_mtx);\n    valid_count += local_valid;\n    pthread_mutex_unlock(&cnt_mtx);\n    return NULL;\n}",
          "explain": "Thay vì khóa cnt_mtx sau mỗi giao dịch (gây tắc nghẽn tới 5000 lần), mỗi luồng đếm riêng vào local_valid trên Stack của mình rồi cuối hàm mới khóa cnt_mtx đúng 1 lần duy nhất để cộng vào valid_count — vừa an toàn khỏi race condition vừa tối ưu hiệu năng."
        },
        {
          "lines": "Dòng 54–64",
          "title": "Đọc số dư, khởi tạo động mảng Mutex và đọc danh sách giao dịch",
          "code": "scanf(\"%d %d %d\", &M, &T, &Q);\nfor (int i = 0; i < M; i++) {\n    scanf(\"%lld\", &bal[i]);\n    pthread_mutex_init(&acc_mtx[i], NULL);\n}\ntxs = (Tx *)malloc(Q * sizeof(Tx));\nfor (int i = 0; i < Q; i++) scanf(\"%d %d %lld\", &txs[i].u, &txs[i].v, &txs[i].amount);",
          "explain": "Vì acc_mtx là một mảng 64 phần tử, ta không thể gán PTHREAD_MUTEX_INITIALIZER trong vòng lặp mà phải gọi pthread_mutex_init(&acc_mtx[i], NULL) cho từng phần tử (tham số NULL là thuộc tính mặc định). Sau đó cấp phát động mảng txs chứa đủ Q giao dịch rồi đọc toàn bộ dữ liệu trước khi tạo luồng."
        },
        {
          "lines": "Dòng 66–75",
          "title": "Phân phối Q giao dịch cho T luồng, chạy song song và join",
          "code": "pthread_t th[16];\nRange ranges[16];\nint base = Q / T, rem = Q % T;\nfor (int i = 0; i < T; i++) {\n    ranges[i].left = i * base + (i < rem ? i : rem);\n    ranges[i].right = ranges[i].left + base + (i < rem ? 1 : 0);\n    pthread_create(&th[i], NULL, worker, &ranges[i]);\n}\nfor (int i = 0; i < T; i++) pthread_join(th[i], NULL);",
          "explain": "Chia đều Q giao dịch cho T luồng (kể cả khi Q < T, các luồng dư có left == right nên vòng for chạy 0 lần và cộng 0 vào valid_count một cách hoàn hảo). Khởi chạy đồng thời T luồng rồi gọi pthread_join chờ tất cả xử lý xong toàn bộ Q giao dịch."
        },
        {
          "lines": "Dòng 77–85",
          "title": "In kết quả, hủy mảng Mutex và giải phóng bộ nhớ",
          "code": "printf(\"%d\\n\", valid_count);\nfor (int i = 0; i < M; i++) {\n    printf(\"%lld%s\", bal[i], (i == M - 1) ? \"\\n\" : \" \");\n}\nfor (int i = 0; i < M; i++) pthread_mutex_destroy(&acc_mtx[i]);\nfree(txs);\nreturn 0;",
          "explain": "Dòng 1 in tổng số giao dịch hợp lệ valid_count; dòng 2 in M số dư cuối cùng bal[0..M-1] (%lld) cách nhau đúng 1 dấu cách (lưu ý tổng số dư toàn ngân hàng luôn bảo toàn không đổi so với ban đầu!). Cuối cùng gọi pthread_mutex_destroy(&acc_mtx[i]) để giải phóng tài nguyên hệ thống của M khóa đã khởi tạo động và gọi free(txs)."
        }
      ],
      "testCases": [
        {
          "name": "Giao dịch ngược chiều kết hợp lệnh không hợp lệ",
          "caseDesc": "M = 3, T = 2, Q = 4, bal = [100, 200, 300], txs = [(0,1,50), (1,0,20), (2,2,10), (1,2,-5)]",
          "howHandled": "Bỏ qua (2,2,10) vì u == v và (1,2,-5) vì amt <= 0; hai lệnh hợp lệ (0→1: 50) và (1→0: 20) đều khóa acc_mtx[0] trước acc_mtx[1] → in 2 và 70 230 300."
        },
        {
          "name": "Chỉ số tài khoản vượt biên và số tiền bằng 0",
          "caseDesc": "txs gồm (-1, 0, 100), (0, M, 50), (0, 1, 0)",
          "howHandled": "Tất cả đều bị chặn bởi bộ lọc dòng 29 trước khi chạm vào acc_mtx[], không gây lỗi Segmentation Fault truy cập ngoài mảng; valid_count = 0 và số dư giữ nguyên."
        },
        {
          "name": "Stress test xung đột cực đại (M = 2, T = 8, Q = 5000)",
          "caseDesc": "8 luồng liên tục chuyển qua lại giữa đúng 2 tài khoản 0 và 1 xen kẽ (0→1) và (1→0)",
          "howHandled": "Nếu thiếu Lock Ordering chương trình treo cứng chỉ sau vài mili-giây; nhờ luôn khóa acc_mtx[0] trước acc_mtx[1], 5000 lệnh chạy trơn tru, không bao giờ Deadlock và tổng bal[0] + bal[1] bảo toàn tuyệt đối."
        },
        {
          "name": "Số dư sau giao dịch có thể âm hoặc vượt 32-bit int",
          "caseDesc": "M = 2, bal = [1000000000, 1000000000], 3000 lệnh (0 → 1, 1000000)",
          "howHandled": "bal[0] giảm xuống -2×10^9, bal[1] tăng lên 4×10^9 vượt INT_MAX; nhờ dùng long long cho bal[] và amount, kết quả in đúng tuyệt đối."
        }
      ],
      "examRecipe": [
        "Khai báo struct Tx { int u, v; long long amount; };, long long bal[64];, pthread_mutex_t acc_mtx[64];, cnt_mtx và valid_count = 0;.",
        "Trong main(): đọc bal[i] (%lld) kèm pthread_mutex_init(&acc_mtx[i], NULL); cho từng tài khoản i = 0..M-1.",
        "Trong worker: lọc ngay if (u < 0 || u >= M || v < 0 || v >= M || u == v || amt <= 0) continue; để tránh truy cập sai và Self-Deadlock.",
        "Áp dụng Lock Ordering: first = (u < v) ? u : v; second = (u < v) ? v : u; → khóa first → khóa second → bal[u] -= amt; bal[v] += amt; (KHÔNG nhầm u/v với first/second!) → mở second → mở first.",
        "Đếm vào local_valid rồi khóa cnt_mtx 1 lần ở cuối hàm để cộng vào valid_count.",
        "Sau pthread_join: in valid_count và bal[0..M-1], gọi pthread_mutex_destroy(&acc_mtx[i]) cho i = 0..M-1 và free(txs)."
      ]
    }
  }
];
