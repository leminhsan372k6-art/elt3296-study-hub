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
      "origin": "Chương 4 — Tạo luồng và trả kết quả động qua tham số thứ hai của pthread_join() (Mục 4.3, 4.5 · Lab 4 Bài 2).",
      "lineByLine": [
        {
          "lines": "Dòng 8–16",
          "code": "long long *res = malloc(sizeof(long long)); ... return res;",
          "explain": "Cấp phát kết quả trên Heap để vùng nhớ không bị hủy sau khi luồng con kết thúc (tuyệt đối không return &bien_cuc_bo!)."
        },
        {
          "lines": "Dòng 23–27",
          "code": "pthread_create(&tid, NULL, sum_worker, NULL); pthread_join(tid, &ret);",
          "explain": "Luồng chính tạo luồng con rồi chờ nhận con trỏ void *ret chứa địa chỉ của res."
        },
        {
          "lines": "Dòng 29–33",
          "code": "long long ans = *(long long *)ret; free(ret); free(a);",
          "explain": "Ép kiểu con trỏ void* về long long*, đọc giá trị in ra rồi gọi free(ret) giải phóng bộ nhớ tránh memory leak."
        }
      ],
      "testCases": [
        {
          "name": "Mảng có số âm và dương",
          "caseDesc": "5 / 3 -2 10 7 4",
          "howHandled": "Tổng 22 trả qua ret và in đúng 22."
        },
        {
          "name": "Mảng lớn n = 10^5, |a_i| = 10^6",
          "caseDesc": "Tổng có thể tới ±10^11 vượt int",
          "howHandled": "Tính và trả về kiểu long long*."
        }
      ],
      "examRecipe": [
        "Header: <pthread.h>, <stdlib.h>. Biên dịch có -pthread.",
        "Trong hàm luồng: malloc(sizeof(long long)), tính tổng vào *res rồi return res.",
        "Trong main: pthread_create → void *ret; pthread_join(tid, &ret);",
        "Đọc *(long long *)ret, in %lld rồi NHỚ free(ret)."
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
      "origin": "Chương 4 — Bảo vệ biến đếm toàn cục đa luồng bằng pthread_mutex_t (Mục 4.8, 4.9 · Lab 4 Bài 5).",
      "lineByLine": [
        {
          "lines": "Dòng 4–6",
          "code": "long long counter = 0; pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;",
          "explain": "Khởi tạo tĩnh khóa mutex bảo vệ biến dùng chung counter."
        },
        {
          "lines": "Dòng 10–22",
          "code": "id % 2 == 1 tăng inc_cnt lần; chẵn giảm dec_cnt lần",
          "explain": "Mỗi thao tác counter++/counter-- được bọc chặt trong pthread_mutex_lock/unlock để chống race condition."
        },
        {
          "lines": "Dòng 31–39",
          "code": "int ids[20]; ids[i] = i + 1; pthread_create(&t[i], ..., &ids[i]);",
          "explain": "Lưu ID của từng luồng vào mảng ids[] riêng (KHÔNG truyền &i!) và tách riêng 2 vòng for create/join để k luồng chạy song song."
        }
      ],
      "testCases": [
        {
          "name": "k = 5, inc = 100, dec = 40",
          "caseDesc": "3 luồng lẻ (+300), 2 luồng chẵn (-80)",
          "howHandled": "counter = 300 - 80 = 220."
        },
        {
          "name": "inc = 0 hoặc dec = 0, k = 16",
          "caseDesc": "16 luồng chạy 50.000 lượt đồng thời",
          "howHandled": "Không mất lượt cộng/trừ nào nhờ mutex."
        }
      ],
      "examRecipe": [
        "Khai báo counter toàn cục và pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER.",
        "Dùng mảng int ids[20] lưu i + 1 để truyền &ids[i] vào pthread_create.",
        "Luồng lẻ tăng inc lần, luồng chẵn giảm dec lần — khóa/mở mutex quanh counter++/counter--.",
        "Join toàn bộ k luồng rồi in counter."
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
      "origin": "Chương 4 — Truyền struct tham số riêng cho từng luồng và tổng hợp kết quả cục bộ (Mục 4.3, 4.7).",
      "lineByLine": [
        {
          "lines": "Dòng 7–11",
          "code": "typedef struct { int left, right, local_max; } Task;",
          "explain": "Đóng gói phạm vi [left, right) và ô kết quả riêng local_max cho từng luồng, vừa tránh truyền &i vừa không cần mutex."
        },
        {
          "lines": "Dòng 15–19",
          "code": "int mx = a[t->left]; for (i = left+1 .. right-1)",
          "explain": "Khởi tạo mx = a[t->left] (phần tử đầu tiên của đoạn) giúp hoạt động chính xác kể cả khi toàn bộ mảng là số âm!"
        },
        {
          "lines": "Dòng 29–37",
          "code": "nt = min(k, n); base = n / nt; rem = n % nt;",
          "explain": "Chia đều mảng khi n không chia hết cho k và tránh tạo luồng rỗng khi k > n."
        }
      ],
      "testCases": [
        {
          "name": "Mảng toàn số âm",
          "caseDesc": "-100 -50 -200",
          "howHandled": "Khởi tạo mx = a[left] thay vì 0 nên trả đúng -50."
        },
        {
          "name": "k > n hoặc n % k != 0",
          "caseDesc": "n = 6, k = 4 hoặc n = 2, k = 8",
          "howHandled": "nt = min(n, k) đảm bảo mỗi luồng có ít nhất 1 phần tử."
        }
      ],
      "examRecipe": [
        "Tạo struct Task { int left, right, local_max; } và mảng Task args[20].",
        "Tính nt = (k < n) ? k : n; chia đoạn [left, right) bằng base = n/nt, rem = n%nt.",
        "Mỗi luồng khởi tạo mx = a[left], duyệt tới right-1 rồi ghi t->local_max = mx.",
        "Join hết nt luồng → duyệt args[0..nt-1].local_max tìm max toàn mảng."
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
      "origin": "Chương 4 — Điều phối thứ tự giữa 2 luồng bằng Mutex và Condition Variable (Mục 4.10 · Slide APT04).",
      "lineByLine": [
        {
          "lines": "Dòng 4–7",
          "code": "int cur = 1; mtx; cond;",
          "explain": "Biến cur giữ số cần in tiếp theo (bắt đầu từ 1). Chỉ có luồng đúng lượt mới được in."
        },
        {
          "lines": "Dòng 13–15",
          "code": "while (cur <= n && cur % 2 == 0) pthread_cond_wait(&cond, &mtx);",
          "explain": "Luồng lẻ ngủ chờ khi vẫn còn số phải in nhưng đang là lượt số chẵn. Luôn dùng while chống spurious wakeup."
        },
        {
          "lines": "Dòng 16–19",
          "code": "if (cur > n) { pthread_mutex_unlock(&mtx); break; }",
          "explain": "Kiểm tra kết thúc: mở khóa mutex trước khi thoát vòng lặp để không gây deadlock cho luồng kia."
        },
        {
          "lines": "Dòng 20–22",
          "code": "printf(\"%d%s\", cur, (cur == n) ? \"\\n\" : \" \"); cur++; pthread_cond_signal(&cond);",
          "explain": "In số hiện tại (không dư dấu cách ở số cuối cùng n), tăng cur rồi đánh thức luồng kia."
        }
      ],
      "testCases": [
        {
          "name": "n chẵn (n = 6)",
          "caseDesc": "6",
          "howHandled": "In đúng \"1 2 3 4 5 6\\n\", luồng chẵn tăng cur lên 7 rồi signal đánh thức luồng lẻ thoát sạch."
        },
        {
          "name": "n lẻ (n = 1 hoặc n = 5)",
          "caseDesc": "1",
          "howHandled": "Luồng lẻ in \"1\\n\", tăng cur lên 2 và signal luồng chẵn thấy cur > n thoát ngay."
        }
      ],
      "examRecipe": [
        "Dùng biến chung cur = 1, 1 mutex và 1 condvar.",
        "Luồng lẻ đợi while (cur <= n && cur % 2 == 0); luồng chẵn đợi while (cur <= n && cur % 2 == 1).",
        "Nếu cur > n thì unlock rồi break.",
        "In cur (dấu cách nếu cur < n, \\n nếu cur == n), tăng cur++, gọi pthread_cond_signal(&cond), rồi unlock."
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
      "origin": "Chương 4 — Tự cài đặt Barrier bằng Mutex và Condition Variable (Mục 4.10 · Lab 4 Bài 6).",
      "lineByLine": [
        {
          "lines": "Dòng 14",
          "code": "a[id] = a[id] * a[id];",
          "explain": "Pha 1: mỗi luồng chỉ sửa ô a[id] riêng nên không cần mutex."
        },
        {
          "lines": "Dòng 17–26",
          "code": "arrived++; if (arrived == k) pthread_cond_broadcast(&cond); else while (arrived < k) wait;",
          "explain": "Rào cản Barrier: k - 1 luồng đầu đi ngủ chờ arrived == k; luồng cuối cùng gọi pthread_cond_broadcast() đánh thức TẤT CẢ cùng lúc để bước sang Pha 2."
        },
        {
          "lines": "Dòng 29",
          "code": "b[id] = a[id] + a[(id + 1) % k];",
          "explain": "Pha 2: vì mọi luồng đã hoàn tất Pha 1 trước barrier, đọc a[(id + 1) % k] đảm bảo luôn lấy đúng giá trị bình phương mới."
        }
      ],
      "testCases": [
        {
          "name": "k = 4: [1, 2, 3, 4]",
          "caseDesc": "Pha 1 → [1, 4, 9, 16]",
          "howHandled": "Pha 2 → b = [1+4, 4+9, 9+16, 16+1] = [5, 13, 25, 17]."
        },
        {
          "name": "k = 1: [5]",
          "caseDesc": "Chỉ có 1 luồng",
          "howHandled": "arrived == 1 == k, broadcast ngay → b[0] = 25 + 25 = 50."
        },
        {
          "name": "Số âm lớn a_i = -10000",
          "caseDesc": "Bình phương 10^8, cộng 2*10^8",
          "howHandled": "Mảng long long xử lý an toàn."
        }
      ],
      "examRecipe": [
        "Cấm dùng pthread_barrier_t; tự viết bằng biến arrived, mtx và cond.",
        "Pha 1: a[id] = a[id] * a[id].",
        "Barrier: lock → arrived++ → nếu arrived == k thì broadcast, ngược lại while (arrived < k) cond_wait → unlock.",
        "Pha 2: b[id] = a[id] + a[(id + 1) % k].",
        "Join hết k luồng rồi in mảng b."
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
      "origin": "Chương 4 — Mô hình Producer-Consumer với bộ đệm vòng dung lượng B và 2 Condition Variables (Mục 4.10 · Lab 4 Bài 7 · Đề cuối kỳ).",
      "lineByLine": [
        {
          "lines": "Dòng 7–8",
          "code": "int buf[64]; int head = 0, tail = 0, count = 0;",
          "explain": "Hàng đợi vòng dung lượng đúng B (B <= 64) đảm bảo thứ tự FIFO chuẩn xác."
        },
        {
          "lines": "Dòng 18–26",
          "code": "Producer: while (count == B) wait(&not_full); ghi buf[tail]; signal(&not_empty);",
          "explain": "Đầy thì ngủ chờ not_full; đẩy xong thì cập nhật tail = (tail + 1) % B, count++ và đánh thức Consumer."
        },
        {
          "lines": "Dòng 34–44",
          "code": "Consumer: while (count == 0) wait(&not_empty); lấy buf[head]; signal(&not_full);",
          "explain": "Rỗng thì ngủ chờ not_empty; lấy xong theo đúng thứ tự FIFO lượt i (1..n), báo not_full và cộng dồn i * val."
        }
      ],
      "testCases": [
        {
          "name": "B = 2, n = 4: [5, -1, 3, 2]",
          "caseDesc": "Bộ đệm nhỏ hơn n buộc chờ nhiều lần",
          "howHandled": "1*5 + 2*(-1) + 3*3 + 4*2 = 5 - 2 + 9 + 8 = 20."
        },
        {
          "name": "B = 1 (truyền từng phần tử một)",
          "caseDesc": "B = 1, n = 10000",
          "howHandled": "(head + 1) % 1 == 0, luân phiên nhịp nhàng không deadlock."
        }
      ],
      "examRecipe": [
        "Hàng đợi vòng: buf[64], head = 0, tail = 0, count = 0; 1 mutex + 2 condvar (not_full, not_empty).",
        "Producer: lock → while (count == B) wait(not_full) → push → signal(not_empty) → unlock.",
        "Consumer: lock → while (count == 0) wait(not_empty) → pop → signal(not_full) → unlock → cộng (long long)i * val."
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
      "origin": "Chương 4 — Nhiều Producer – Nhiều Consumer kết thúc an toàn không Deadlock bằng active_producers + broadcast (Mục 4.10).",
      "lineByLine": [
        {
          "lines": "Dòng 34–39",
          "code": "active_producers--; if (active_producers == 0) pthread_cond_broadcast(&not_empty);",
          "explain": "Chìa khóa chống treo: khi Producer cuối cùng kết thúc, gọi broadcast đánh thức TẤT CẢ Consumer đang ngủ để chúng kiểm tra điều kiện dừng."
        },
        {
          "lines": "Dòng 48–54",
          "code": "while (count == 0 && active_producers > 0) wait; if (count == 0 && active_producers == 0) break;",
          "explain": "Consumer chỉ ngủ khi kho rỗng MÀ vẫn còn Producer đang chạy; khi cả kho rỗng lẫn hết Producer thì mở khóa và thoát sạch!"
        },
        {
          "lines": "Dòng 61–66",
          "code": "if (val % 2 == 0) local_even += val; ... even_sum += local_even;",
          "explain": "Trong C, (-2) % 2 == 0 hoạt động đúng cho cả số chẵn âm! Cộng vào biến cục bộ rồi mới cộng 1 lần vào even_sum."
        }
      ],
      "testCases": [
        {
          "name": "Có số chẵn âm và số 0",
          "caseDesc": "P=2 C=3 B=2 n=6: 4 7 -2 5 8 0",
          "howHandled": "Các số chẵn là 4, -2, 8, 0 → tổng = 10; cả 3 Consumer thoát sạch."
        },
        {
          "name": "P > n (có Producer không có phần tử nào)",
          "caseDesc": "P = 8, n = 2",
          "howHandled": "Producer thừa có left == right, bỏ qua vòng for, giảm active_producers-- bình thường."
        }
      ],
      "examRecipe": [
        "Khởi tạo active_producers = P trước khi tạo luồng.",
        "Producer: đẩy xong đoạn [left, right) → khóa mtx, giảm active_producers--, nếu == 0 thì pthread_cond_broadcast(&not_empty).",
        "Consumer: đợi while (count == 0 && active_producers > 0); nếu count == 0 && active_producers == 0 thì unlock rồi break.",
        "Kiểm tra val % 2 == 0 cộng vào local_even, cuối hàm cộng vào even_sum dưới mutex."
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
      "origin": "Chương 4 — Chống Deadlock bằng quy tắc Thứ tự Khóa (Lock Ordering) trên mảng Mutex (Mục 4.9).",
      "lineByLine": [
        {
          "lines": "Dòng 12",
          "code": "pthread_mutex_t acc_mtx[64];",
          "explain": "Mỗi tài khoản sở hữu 1 khóa riêng trong mảng để nhiều cặp tài khoản không liên quan có thể giao dịch song song."
        },
        {
          "lines": "Dòng 29–31",
          "code": "if (u < 0 || u >= M || v < 0 || v >= M || u == v || amt <= 0) continue;",
          "explain": "Lọc bỏ mọi giao dịch không hợp lệ (tự chuyển cho mình u == v, chỉ số ngoài [0..M-1], hoặc số tiền <= 0)."
        },
        {
          "lines": "Dòng 33–43",
          "code": "first = min(u, v); second = max(u, v); lock(first); lock(second); ...",
          "explain": "Luôn khóa tài khoản có chỉ số nhỏ trước, chỉ số lớn sau → triệt tiêu hoàn toàn chu trình chờ (Circular Wait), không thể xảy ra Deadlock."
        }
      ],
      "testCases": [
        {
          "name": "Giao dịch ngược chiều (0→1 và 1→0) kèm lệnh lỗi",
          "caseDesc": "3 2 4 / 100 200 300 / (0,1,50), (1,0,20), (2,2,10), (1,2,-5)",
          "howHandled": "Bỏ (2,2,10) và (1,2,-5); còn 2 lệnh hợp lệ → in 2 và 70 230 300."
        },
        {
          "name": "Q = 5000 giao dịch xung đột cao",
          "caseDesc": "T = 8 luồng cùng chuyển qua lại",
          "howHandled": "Không bao giờ treo Deadlock nhờ thứ tự khóa tăng dần."
        }
      ],
      "examRecipe": [
        "Khởi tạo mảng pthread_mutex_t acc_mtx[64] cho từng tài khoản.",
        "Lọc bỏ giao dịch nếu u, v ngoài [0, M-1], u == v, hoặc amount <= 0.",
        "Tính first = (u < v) ? u : v; second = (u < v) ? v : u.",
        "Khóa acc_mtx[first] → acc_mtx[second] → cập nhật bal[u] -= amt, bal[v] += amt → mở khóa ngược lại.",
        "Đếm local_valid rồi cộng vào valid_count bằng cnt_mtx."
      ]
    }
  }
];
