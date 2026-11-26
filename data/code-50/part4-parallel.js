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
      "origin": "Chương 5 — Phân hoạch Foster & kỹ thuật Local Counter `psum_local` tránh nghẽn mutex (Mục 5.4, 5.7 · Lab 5 Bài 1).",
      "lineByLine": [
        {
          "lines": "Dòng 10–16",
          "code": "total = R - L + 1; start = L + tid*base + min(tid, rem);",
          "explain": "Phân hoạch tĩnh đoạn [L, R] thành T đoạn liên tiếp không bỏ sót, không trùng lặp."
        },
        {
          "lines": "Dòng 18–24",
          "code": "long long local_cnt = 0; ... counts[tid] = local_cnt;",
          "explain": "Đếm hoàn toàn trong biến cục bộ (nằm trên thanh ghi CPU), không khóa mutex trong vòng lặp và chỉ ghi 1 lần vào counts[tid] để tránh false sharing."
        }
      ],
      "testCases": [
        {
          "name": "Đoạn nhỏ [1, 20], d = 3, T = 4",
          "caseDesc": "Các số lẻ chia hết cho 3: 3, 9, 15",
          "howHandled": "In đúng 3."
        },
        {
          "name": "Đoạn cực nhỏ nhỏ hơn T (L=5, R=5, T=8)",
          "caseDesc": "total = 1 < T",
          "howHandled": "Luồng 0 xử lý [5, 5], luồng 1..7 có len = 0 (end < start) bỏ qua vòng for an toàn."
        },
        {
          "name": "Đoạn lớn 10^7",
          "caseDesc": "1 10000000 3 8",
          "howHandled": "Chạy rất nhanh nhờ local counter không mutex."
        }
      ],
      "examRecipe": [
        "Chia total = R - L + 1 bằng base = total / T, rem = total % T.",
        "Mỗi luồng dùng biến cục bộ long long local_cnt = 0 đếm x % 2 != 0 && x % d == 0.",
        "Hết vòng lặp mới gán counts[tid] = local_cnt (tuyệt đối không dùng mutex trong vòng đếm!).",
        "Join T luồng rồi cộng dồn counts[0..T-1]."
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
      "origin": "Chương 5 — Phân hoạch tĩnh không chia hết (Static Mapping) & biến tích lũy cục bộ (Mục 5.4, 5.7).",
      "lineByLine": [
        {
          "lines": "Dòng 11–13",
          "code": "base = n / T; rem = n % T; start = tid * base + (tid < rem ? tid : rem);",
          "explain": "Công thức vàng cho mọi bài phân hoạch tĩnh: rem luồng đầu nhận (base + 1) phần tử, các luồng còn lại nhận base phần tử."
        },
        {
          "lines": "Dòng 15–19",
          "code": "local_sum += (long long)a[i] * a[i]; partial[tid] = local_sum;",
          "explain": "Ép long long trước khi bình phương để an toàn; cộng cục bộ rồi lưu 1 lần vào partial[tid]."
        }
      ],
      "testCases": [
        {
          "name": "n không chia hết cho T",
          "caseDesc": "n = 7, T = 3: [1, -2, 3, 0, 4, -5, 2]",
          "howHandled": "3 luồng nhận [0,3), [3,5), [5,7) → tổng 1+4+9+0+16+25+4 = 59."
        },
        {
          "name": "T > n",
          "caseDesc": "n = 3, T = 8",
          "howHandled": "base = 0, rem = 3: 3 luồng đầu mỗi luồng 1 phần tử, 5 luồng sau [3,3) ghi 0."
        }
      ],
      "examRecipe": [
        "Thuộc lòng công thức phân hoạch tĩnh: start = tid*base + (tid < rem ? tid : rem), end = start + base + (tid < rem ? 1 : 0).",
        "Cộng (long long)a[i] * a[i] vào biến cục bộ rồi ghi partial[tid].",
        "Join hết T luồng và cộng tổng partial[0..T-1]."
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
      "origin": "Chương 5 — Tính tích vô hướng hai vector song song (Data Parallelism · Mục 5.1, 5.7).",
      "lineByLine": [
        {
          "lines": "Dòng 11–19",
          "code": "Phân hoạch [start, end) → local_sum += (long long)A[i] * B[i]; partial[tid] = local_sum;",
          "explain": "Cấu trúc giống hệt CR-26, thay bình phương bằng tích A[i] * B[i] (ép kiểu long long tránh tràn khi n = 10^5)."
        },
        {
          "lines": "Dòng 32–40",
          "code": "Tạo T luồng → join T luồng → cộng partial[0..T-1]",
          "explain": "Không cần bất kỳ mutex nào vì mảng A, B chỉ đọc và mỗi luồng ghi 1 ô partial[tid] riêng."
        }
      ],
      "testCases": [
        {
          "name": "Tích vô hướng ra số âm",
          "caseDesc": "A=[2,-1,4,3,0], B=[5,6,-2,1,9]",
          "howHandled": "10 - 6 - 8 + 3 + 0 = -1."
        },
        {
          "name": "n = 10^5, A_i = B_i = 10^4",
          "caseDesc": "Tổng = 10^13",
          "howHandled": "long long chứa tới 9*10^18 nên hoàn toàn chính xác."
        }
      ],
      "examRecipe": [
        "Cùng mẫu khuôn với CR-26: chỉ cần nhớ công thức phân hoạch tĩnh + biến cục bộ local_sum.",
        "Viết (long long)A[i] * B[i] và ghi 1 lần vào partial[tid].",
        "Join hết rồi cộng dồn in %lld."
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
      "origin": "Chương 5 — Kỹ thuật Map-Reduce cục bộ tính Histogram song song (Lab 5 Bài 2).",
      "lineByLine": [
        {
          "lines": "Dòng 15–21",
          "code": "long long my_hist[256] = {0}; đếm trên [start, end) → chép ra local_hist[tid]",
          "explain": "Pha Map: mỗi luồng đếm hoàn toàn độc lập trên mảng cục bộ 256 phần tử (không dùng mutex!)."
        },
        {
          "lines": "Dòng 38–41",
          "code": "Cộng gộp local_hist[t][v] về hist[v]",
          "explain": "Pha Reduce: luồng chính cộng gộp T bảng sau khi pthread_join()."
        },
        {
          "lines": "Dòng 43–51",
          "code": "Duyệt v = 0..255; chỉ cập nhật khi hist[v] > mode_freq",
          "explain": "Nhờ duyệt tăng dần 0 → 255 và so sánh NGHIÊM NGẶT `>`, nếu có nhiều giá trị pixel cùng tần suất lớn nhất thì tự động giữ giá trị nhỏ nhất!"
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ chuẩn",
          "caseDesc": "8 3 / 5 2 5 10 2 0 10 2",
          "howHandled": "4 giá trị khác nhau (0,2,5,10), mode = 2 với tần suất 3 → in \"4 2 3\"."
        },
        {
          "name": "Hòa tần suất lớn nhất",
          "caseDesc": "2 5 2 5",
          "howHandled": "v=2 có freq=2, tới v=5 cũng freq=2 không > mode_freq nên giữ mode_val = 2 (nhỏ hơn)."
        }
      ],
      "examRecipe": [
        "Mỗi luồng khai báo mảng cục bộ long long my_hist[256] = {0}; đếm đoạn của mình không dùng mutex.",
        "Sao chép sang local_hist[tid][0..255].",
        "Sau join: cộng gộp vào hist[256].",
        "Duyệt v = 0..255 đếm distinct và cập nhật mode_val khi hist[v] > mode_freq (dấu > nghiêm ngặt)."
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
      "origin": "Chương 5 — Tìm kiếm song song có dừng sớm (Early Stopping · Lab 5 Bài 3).",
      "lineByLine": [
        {
          "lines": "Dòng 7–9",
          "code": "int found = 0, found_idx = -1; pthread_mutex_t mtx;",
          "explain": "Cờ dùng chung báo dừng sớm và lưu chỉ số 0-based tìm thấy, bảo vệ bởi mutex."
        },
        {
          "lines": "Dòng 18–23",
          "code": "Mỗi 256 phần tử kiểm tra found dưới khóa mutex; nếu stop thì break",
          "explain": "Kiểm tra định kỳ (không khóa ở MỌI phần tử để giữ tốc độ cao!) giúp luồng khác thoát sớm ngay khi có luồng tìm ra."
        },
        {
          "lines": "Dòng 24–30",
          "code": "if (a[i] == target) { lock; found = 1; found_idx = i; unlock; break; }",
          "explain": "Cập nhật an toàn và dừng ngay luồng hiện tại."
        }
      ],
      "testCases": [
        {
          "name": "Tìm thấy target",
          "caseDesc": "6 25 3 / 11 4 25 9 30 -7",
          "howHandled": "a[2] == 25 → found_idx = 2, các luồng dừng sớm, in 2."
        },
        {
          "name": "Không tồn tại target",
          "caseDesc": "target không có trong mảng",
          "howHandled": "found_idx giữ nguyên -1 → in -1."
        }
      ],
      "examRecipe": [
        "Khởi tạo found = 0, found_idx = -1 và 1 mutex.",
        "Trong vòng for: cứ mỗi 256 bước thì khóa kiểm tra found, nếu == 1 thì break.",
        "Nếu a[i] == target: khóa mutex, đặt found = 1, found_idx = i, mở khóa và break.",
        "Join hết T luồng rồi in found_idx."
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
      "origin": "Chương 6 — Nhân ma trận song song theo dải hàng kết hợp Loop Interchange i-k-j (Mục 6.1, 6.5 · Lab 5 Bài 4).",
      "lineByLine": [
        {
          "lines": "Dòng 9–12",
          "code": "nt = min(T, M); phân hoạch hàng [r_start, r_end)",
          "explain": "Chia M hàng cho nt luồng — mỗi luồng chỉ ghi vào các hàng C[i] của riêng mình nên không cần mutex."
        },
        {
          "lines": "Dòng 16–21",
          "code": "Vòng lặp i - k - j với aik = A[i][k]",
          "explain": "Đảo vòng k ra ngoài j (Loop Interchange) giúp truy cập B[k][j] và C[i][j] liên tiếp trên cùng hàng (tối ưu cache)."
        },
        {
          "lines": "Dòng 42–46",
          "code": "printf(\"%lld%s\", C[i][j], (j == N - 1) ? \"\\n\" : \" \");",
          "explain": "In ma trận chuẩn xác không bao giờ dư khoảng trắng cuối dòng."
        }
      ],
      "testCases": [
        {
          "name": "Ma trận không vuông (2x3 * 3x2)",
          "caseDesc": "A=[[1,2,3],[4,5,6]], B=[[7,8],[9,10],[11,12]]",
          "howHandled": "C=[[58,64],[139,154]]."
        },
        {
          "name": "T > M (ví dụ M = 1, T = 8)",
          "caseDesc": "Ít hàng hơn số luồng",
          "howHandled": "nt = min(T, M) = 1, không tạo luồng thừa."
        }
      ],
      "examRecipe": [
        "Khai báo mảng tĩnh long long A[105][105], B[105][105], C[105][105] (vì M, K, N <= 100 rất gọn!).",
        "Tính nt = min(T, M) và chia dải hàng [r_start, r_end) bằng base/rem.",
        "Trong mỗi luồng dùng thứ tự vòng lặp i - k - j (khởi tạo C[i][j] = 0 trước).",
        "Join hết rồi in M dòng, tránh khoảng trắng thừa cuối dòng."
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
      "origin": "Chương 6 — Sắp xếp nhanh song song (Parallel Quicksort) có ngưỡng threshold và độ sâu max_depth (Mục 6.6, 6.7, 6.8 · Lab 5 Bài 5).",
      "lineByLine": [
        {
          "lines": "Dòng 16–31",
          "code": "seq_qsort(l, r) chọn pivot = a[(l + r) / 2]",
          "explain": "Quicksort tuần tự phân hoạch Hoare cực nhanh, chọn pivot ở giữa tránh suy biến O(n^2) khi mảng đã sắp xếp sẵn hoặc có nhiều phần tử trùng nhau!"
        },
        {
          "lines": "Dòng 38–41",
          "code": "if (r - l + 1 <= threshold || depth >= max_depth) { seq_qsort(l, r); return NULL; }",
          "explain": "Khi đoạn đủ nhỏ hoặc chạm giới hạn độ sâu thì chuyển ngay sang sắp xếp tuần tự để không sinh quá nhiều luồng."
        },
        {
          "lines": "Dòng 55–70",
          "code": "Sinh 1 luồng con cho nhánh trái [l, j], luồng hiện tại tự xử lý nhánh phải [i, r] rồi pthread_join(left_th)",
          "explain": "Vì gọi pthread_join ngay trước khi return, biến SortTask left_task nằm trên stack luôn sống đủ lâu — không cần malloc/free!"
        }
      ],
      "testCases": [
        {
          "name": "Mảng có số âm và trùng nhau",
          "caseDesc": "8 2 2 / 9 -3 5 1 8 5 -10 2",
          "howHandled": "In \"-10 -3 1 2 5 5 8 9\"."
        },
        {
          "name": "max_depth = 0 hoặc n = 1",
          "caseDesc": "Không sinh luồng nào",
          "howHandled": "Rẽ thẳng vào seq_qsort an toàn."
        },
        {
          "name": "Mảng 10^5 phần tử đã sắp xếp sẵn",
          "caseDesc": "Trường hợp xấu nhất của Lomuto",
          "howHandled": "Hoare + pivot giữa chạy O(n log n) siêu nhanh."
        }
      ],
      "examRecipe": [
        "Viết hàm seq_qsort(l, r) theo phân hoạch Hoare (chọn pivot = a[(l + r) / 2]).",
        "Trong par_qsort: nếu r - l + 1 <= threshold || depth >= max_depth thì gọi seq_qsort và return.",
        "Phân hoạch thành [l, j] và [i, r] → pthread_create cho [l, j] ở depth + 1 → tự gọi đệ quy cho [i, r] → pthread_join nhánh trái."
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
      "origin": "Chương 6 — Nhân ma trận vuông song song kết hợp Cache Blocking / Tiling (Mục 6.4 · Slide APT06 Slide 9).",
      "lineByLine": [
        {
          "lines": "Dòng 17–29",
          "code": "3 vòng ngoài ii, kk, jj bước nhảy += B_tile; 3 vòng trong i, k, j bị chặn bởi r_end và N",
          "explain": "Triển khai đúng mẫu Cache Blocking ở Slide APT06: xử lý trọn từng khối B_tile x B_tile nằm gọn trong L1 Cache. Điều kiện `&& i < r_end`, `&& k < N`, `&& j < N` xử lý gọn phần dư khi N không chia hết cho B_tile."
        },
        {
          "lines": "Dòng 50–54",
          "code": "Tính tổng từng hàng row_sum của C rồi in 1 dòng N số",
          "explain": "In đúng N số nguyên cách nhau 1 dấu cách, không dấu cách thừa ở cuối."
        }
      ],
      "testCases": [
        {
          "name": "N không chia hết cho B_tile và T",
          "caseDesc": "N = 3, B_tile = 2, T = 2",
          "howHandled": "Các khối biên kích thước 1 được chặn đúng bởi && j < N → in \"11 13 13\"."
        },
        {
          "name": "N = 200, B_tile = 32, T = 8",
          "caseDesc": "Ma trận lớn tối đa",
          "howHandled": "Tối đa 200 * 10^4 = 2*10^6 mỗi ô, long long tuyệt đối an toàn."
        }
      ],
      "examRecipe": [
        "Chia hàng [r_start, r_end) cho nt = min(T, N) luồng và gán C[i][j] = 0 trước.",
        "Viết 3 vòng khối (ii, kk, jj bước += B_tile) bọc 3 vòng con (i, k, j có chặn biên && < r_end / N).",
        "Trong vòng con cập nhật C[i][j] += A[i][k] * B[k][j].",
        "Join hết rồi tính tổng từng hàng C[i][0..N-1] và in trên 1 dòng."
      ]
    }
  }
];
