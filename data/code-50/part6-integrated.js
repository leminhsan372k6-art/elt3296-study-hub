export const PART6_INTEGRATED_QUESTIONS = [
  {
    "num": 41,
    "id": "CR-41",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (DP + Thread)",
    "difficulty": "Trung bình",
    "title": "Tính số Fibonacci thứ n bằng Dynamic Programming kết hợp Thread",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join, pthread_mutex_t",
    "prompt": "Cho số nguyên không âm n. Hãy viết chương trình C tính số Fibonacci thứ n, được định nghĩa như sau: F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2) với n >= 2. Chương trình bắt buộc sử dụng Quy hoạch động (Memoization hoặc Tabulation) kết hợp với thư viện pthread: với n >= 2, tạo 2 luồng (Luồng 1 tính F(n - 1), Luồng 2 tính F(n - 2)) cùng sử dụng chung một bảng nhớ (ví dụ memo[]) và được bảo vệ bằng cơ chế đồng bộ pthread_mutex_t để tránh race condition.",
    "requirements": [
      "Sử dụng memoization hoặc tabulation để tránh tính lặp lại các giá trị Fibonacci.",
      "Sử dụng thư viện <pthread.h>, ít nhất hai hàm pthread_create và pthread_join.",
      "Với n >= 2, tạo 2 luồng tính F(n - 1) và F(n - 2) dùng chung một bảng nhớ memo[] có đồng bộ bằng pthread_mutex_t.",
      "Không giữ khóa mutex khi thực hiện lời gọi đệ quy sâu hoặc pthread_join() để tránh deadlock."
    ],
    "inputSpec": "Một dòng chứa số nguyên không âm n.",
    "outputSpec": "Một số nguyên duy nhất là F(n).",
    "constraints": [
      "0 <= n <= 92"
    ],
    "example": {
      "note": "Với n = 50, hai luồng chia sẻ bảng nhớ memo[] tính tức thì F(50) = 12586269025.",
      "input": "50",
      "output": "12586269025"
    },
    "relatedTopics": [
      {
        "id": "4-9",
        "label": "4.9 Chỉ giữ Mutex quanh thao tác đọc/ghi bảng nhớ (Short Critical Section)"
      },
      {
        "id": "7-6",
        "label": "7.6 Quy hoạch động Top-Down Memoization cho Fibonacci (n <= 92)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Sai lầm nguy hiểm nhất ở bài kết hợp DP + Mutex là khóa mutex ở đầu hàm đệ quy fib(k) rồi gọi fib(k - 1) khi vẫn đang giữ khóa — luồng sẽ tự khóa cứng chính nó (Self-Deadlock)! Chỉ khóa mutex trong vài nano-giây để đọc hoặc ghi phần tử memo[k], mở khóa ngay trước khi gọi đệ quy!",
    "relatedQuestions": [
      "CR-18",
      "CR-46",
      "CR-47"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nlong long memo[100];\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\n\nlong long fib_memo(int k) {\n    if (k <= 1) return k;\n\n    pthread_mutex_lock(&mtx);\n    long long val = memo[k];\n    pthread_mutex_unlock(&mtx);\n    if (val != -1) return val;\n\n    long long res = fib_memo(k - 1) + fib_memo(k - 2);\n\n    pthread_mutex_lock(&mtx);\n    memo[k] = res;\n    pthread_mutex_unlock(&mtx);\n    return res;\n}\n\ntypedef struct {\n    int k;\n    long long result;\n} FibArg;\n\nvoid *worker(void *arg) {\n    FibArg *fa = (FibArg *)arg;\n    fa->result = fib_memo(fa->k);\n    return NULL;\n}\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n\n    for (int i = 0; i <= 95; i++) memo[i] = -1;\n    memo[0] = 0;\n    memo[1] = 1;\n\n    if (n <= 1) {\n        printf(\"%lld\\n\", memo[n]);\n        return 0;\n    }\n\n    pthread_t t1, t2;\n    FibArg a1 = { n - 1, 0 };\n    FibArg a2 = { n - 2, 0 };\n\n    pthread_create(&t1, NULL, worker, &a1);\n    pthread_create(&t2, NULL, worker, &a2);\n\n    pthread_join(t1, NULL);\n    pthread_join(t2, NULL);\n\n    printf(\"%lld\\n\", a1.result + a2.result);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Nhả khóa pthread_mutex_unlock(&mtx) ngay trước lệnh gọi đệ quy fib_dp(k - 1) + fib_dp(k - 2) tránh 100% tự khóa (self-deadlock) và cho phép hai luồng song song thật sự.",
      "Kiểu unsigned long long biểu diễn chính xác đến F(92) = 7540113804746346429."
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
          "desc": "Sử dụng bảng nhớ memoization tránh tính lại O(2^n)",
          "regex": "memo|dp",
          "flags": ""
        },
        {
          "desc": "Sử dụng kiểu 64-bit (long long / unsigned long long) cho n <= 92",
          "regex": "long\\s+long",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 4 (Lập trình đa luồng POSIX & Đồng bộ Mutex — Mục 4.9) + Chương 7 (Quy hoạch động Top-Down Memoization cho Fibonacci — Mục 7.6). Bài toán kết hợp nền tảng giữa đệ quy có nhớ và đồng bộ vùng găng ngắn (Short Critical Section) để tránh Self-Deadlock.",
      "idea": {
        "summary": "Để tính số Fibonacci thứ n (0 ≤ n ≤ 92) nhanh mà vẫn khai thác đa luồng đúng yêu cầu đề bài, ta không dùng đệ quy ngây thơ O(2^n) mà lưu kết quả đã tính vào mảng dùng chung memo[100]. Với n ≥ 2, luồng chính sinh đúng 2 luồng con: Luồng 1 tính F(n - 1), Luồng 2 tính F(n - 2), cả hai cùng tra cứu và cập nhật bảng nhớ chung memo[] dưới sự bảo vệ của khóa pthread_mutex_t. Sau khi cả hai luồng hoàn tất (pthread_join), luồng chính cộng hai kết quả lại để ra F(n).",
        "steps": [
          "Bước 1 — Khởi tạo bảng nhớ và khóa đồng bộ: Khai báo mảng toàn cục long long memo[100] khởi tạo toàn bộ bằng -1 (nghĩa là 'chưa tính'), đặt hai giá trị gốc memo[0] = 0, memo[1] = 1 và tạo khóa pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER.",
          "Bước 2 — Xử lý trường hợp cơ sở: Đọc n từ stdin. Nếu n ≤ 1 thì in trực tiếp memo[n] và kết thúc mà không cần tạo luồng.",
          "Bước 3 — Thiết kế hàm fib_memo(k) chống Deadlock: Kiểm tra k ≤ 1 thì trả về k. Nếu không, khóa mtx → đọc memo[k] vào biến cục bộ val → MỞ KHÓA mtx ngay. Nếu val != -1 thì trả về val (tái sử dụng kết quả đã có).",
          "Bước 4 — Đệ quy ngoài vùng găng & lưu kết quả: Khi chưa có trong bảng nhớ, gọi đệ quy fib_memo(k - 1) + fib_memo(k - 2) trong trạng thái KHÔNG giữ khóa mutex; sau khi có kết quả res mới khóa mtx → ghi memo[k] = res → mở khóa.",
          "Bước 5 — Phân công 2 luồng & hợp nhất: Đóng gói tham số vào 2 biến struct FibArg (a1 cho n - 1, a2 cho n - 2), tạo 2 luồng t1, t2 chạy hàm worker, chờ cả hai xong bằng pthread_join() rồi in a1.result + a2.result."
        ],
        "whyThisWay": "Nếu khóa mutex từ đầu hàm fib_memo(k) và giữ nguyên khóa khi gọi đệ quy fib_memo(k - 1), chính luồng đó sẽ lại xin khóa mtx lần thứ hai trên một mutex không đệ quy và tự treo vĩnh viễn (Self-Deadlock). Ngoài ra, chỉ tạo đúng 2 luồng ở tầng gốc thay vì tạo luồng ở mọi bước đệ quy giúp tránh bùng nổ hàng nghìn luồng làm cạn tài nguyên hệ điều hành và vượt giới hạn stack, trong khi vẫn chia sẻ hiệu quả bảng nhớ memo[] ở độ phức tạp tuyến tính.",
        "complexity": "Thời gian: O(n) (mỗi trạng thái 0..n chỉ tính hữu hạn lần) · Bộ nhớ: O(n) (mảng memo[100] + stack đệ quy sâu tối đa n) · Tài nguyên OS: 2 luồng POSIX + 1 pthread_mutex_t"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo thư viện & tài nguyên dùng chung (memo[], mutex)",
          "code": "#include <stdio.h>\n#include <pthread.h>\nlong long memo[100];\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;",
          "explain": "Nạp <stdio.h> cho scanf/printf và <pthread.h> cho API luồng POSIX (biên dịch bắt buộc kèm cờ -pthread). Mảng toàn cục memo[100] dùng kiểu số nguyên 64-bit có dấu long long vì F(92) = 7.540.113.804.746.346.429 vượt xa giới hạn 2,1 tỷ của int 32-bit; kích thước 100 dư sức chứa n ≤ 92. Khóa mtx được khởi tạo tĩnh bằng macro PTHREAD_MUTEX_INITIALIZER để bảo vệ mọi truy cập đồng thời vào memo[] giữa hai luồng."
        },
        {
          "lines": "Dòng 7–13",
          "title": "Điều kiện dừng & tra cứu memo[k] trong vùng găng ngắn",
          "code": "if (k <= 1) return k;\npthread_mutex_lock(&mtx);\nlong long val = memo[k];\npthread_mutex_unlock(&mtx);\nif (val != -1) return val;",
          "explain": "Nếu k ≤ 1 (tức k = 0 hoặc k = 1), hàm trả về ngay k mà không cần chạm vào mutex. Với k ≥ 2, luồng gọi pthread_mutex_lock(&mtx) để độc quyền đọc memo[k] vào biến cục bộ val, rồi LẬP TỨC gọi pthread_mutex_unlock(&mtx) trước khi kiểm tra if (val != -1). Việc chép ra biến cục bộ val và mở khóa ngay giữ cho vùng găng (critical section) cực ngắn (chỉ vài nano-giây) và ngăn tuyệt đối nguy cơ quên mở khóa khi return sớm."
        },
        {
          "lines": "Dòng 15–21",
          "title": "Gọi đệ quy NGOÀI khóa mutex & ghi lưu kết quả vào bảng nhớ",
          "code": "long long res = fib_memo(k - 1) + fib_memo(k - 2);\npthread_mutex_lock(&mtx);\nmemo[k] = res;\npthread_mutex_unlock(&mtx);\nreturn res;",
          "explain": "Dòng 15 thực hiện tính đệ quy fib_memo(k - 1) + fib_memo(k - 2) khi KHÔNG hề giữ khóa mtx — đây là quy tắc sống còn chống Self-Deadlock (nếu giữ khóa khi gọi đệ quy, lời gọi con gặp pthread_mutex_lock(&mtx) sẽ tự chờ chính mình mãi mãi). Sau khi có kết quả res, luồng mới khóa mtx lần nữa, ghi memo[k] = res để luồng kia có thể tái sử dụng ngay lập tức, rồi mở khóa và trả về res."
        },
        {
          "lines": "Dòng 23–32",
          "title": "Đóng gói tham số FibArg & hàm thực thi luồng worker()",
          "code": "typedef struct { int k; long long result; } FibArg;\nvoid *worker(void *arg) {\n    FibArg *fa = (FibArg *)arg;\n    fa->result = fib_memo(fa->k);\n    return NULL;\n}",
          "explain": "Hàm pthread_create() chỉ nhận hàm đích có chữ ký chuẩn void *(*start_routine)(void *) và truyền đúng 1 con trỏ void *arg. Do đó ta định nghĩa struct FibArg chứa cả dữ liệu đầu vào (k) và ô nhận kết quả đầu ra (result). Trong worker(), ép kiểu (FibArg *)arg về đúng con trỏ cấu trúc, gọi fib_memo(fa->k) rồi ghi trực tiếp vào fa->result và trả về NULL (tránh cấp phát heap rườm rà)."
        },
        {
          "lines": "Dòng 34–45",
          "title": "Đọc n, khởi tạo bảng memo[] = -1 & xử lý n ≤ 1",
          "code": "for (int i = 0; i <= 95; i++) memo[i] = -1;\nmemo[0] = 0; memo[1] = 1;\nif (n <= 1) { printf(\"%lld\\n\", memo[n]); return 0; }",
          "explain": "Đọc số nguyên n từ stdin. Mảng toàn cục mặc định mang giá trị 0, nhưng F(0) cũng bằng 0 nên ta KHÔNG thể dùng 0 làm cờ 'chưa tính' — phải gán toàn bộ memo[0..95] = -1 làm giá trị đánh dấu (sentinel), rồi gán rõ memo[0] = 0 và memo[1] = 1. Nếu n ≤ 1, in ngay memo[n] bằng đặc tả %lld (bắt buộc cho long long) và kết thúc chương trình sớm."
        },
        {
          "lines": "Dòng 47–59",
          "title": "Tạo 2 luồng song song, pthread_join() & in F(n)",
          "code": "FibArg a1 = { n - 1, 0 }; FibArg a2 = { n - 2, 0 };\npthread_create(&t1, NULL, worker, &a1);\npthread_create(&t2, NULL, worker, &a2);\npthread_join(t1, NULL); pthread_join(t2, NULL);\nprintf(\"%lld\\n\", a1.result + a2.result);",
          "explain": "Khai báo hai biến định danh luồng pthread_t t1, t2 và hai struct riêng biệt a1 (tính n - 1), a2 (tính n - 2) để hai luồng tuyệt đối không ghi đè tham số của nhau. Gọi pthread_create(&t1, NULL, worker, &a1) và tương tự cho t2 (tham số thứ 2 là NULL dùng thuộc tính mặc định). Kế tiếp gọi pthread_join() cho CẢ HAI luồng để đảm bảo cả a1.result lẫn a2.result đã tính xong hoàn toàn trước khi luồng chính cộng lại và in ra stdout."
        }
      ],
      "testCases": [
        {
          "name": "Trường hợp cơ sở (n = 0 và n = 1)",
          "caseDesc": "Input: 0 → Output: 0; Input: 1 → Output: 1.",
          "howHandled": "Nhánh if (n <= 1) bắt ngay trước khi tạo luồng, in memo[0] = 0 hoặc memo[1] = 1 và thoát sạch, tránh truyền số âm (n - 2 = -1) vào luồng con."
        },
        {
          "name": "Biên nhỏ nhất tạo 2 luồng (n = 2)",
          "caseDesc": "Input: 2 → Luồng 1 tính F(1) = 1, Luồng 2 tính F(0) = 0 → Output: 1.",
          "howHandled": "Cả hai luồng gặp điều kiện dừng if (k <= 1) return k ngay lập tức, pthread_join() hợp nhất ra 1 + 0 = 1."
        },
        {
          "name": "Giá trị trung bình kiểm chứng Memoization (n = 50)",
          "caseDesc": "Input: 50 → Output: 12586269025.",
          "howHandled": "Đệ quy thường mất hàng chục giây cho n = 50, nhưng nhờ memo[] dùng chung giữa 2 luồng có bảo vệ mutex, chương trình kết thúc chỉ trong vài mili-giây và không tràn số nhờ long long."
        },
        {
          "name": "Biên cực đại của long long 64-bit (n = 92)",
          "caseDesc": "Input: 92 → Output: 7540113804746346429 (sát ngưỡng LLONG_MAX ≈ 9.22 × 10^18).",
          "howHandled": "Mọi biến memo[], val, res và FibArg.result đều khai báo long long, in bằng %lld nên chính xác tuyệt đối đến từng chữ số mà không tràn dấu."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp <stdio.h>, <pthread.h>; khai báo toàn cục long long memo[100] và pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER.",
        "Bước 2: Viết fib_memo(k) theo đúng khung 3 đoạn: (a) if (k <= 1) return k; (b) lock → đọc val = memo[k] → unlock → if (val != -1) return val; (c) gọi đệ quy không giữ khóa → lock → ghi memo[k] = res → unlock.",
        "Bước 3: Tạo struct FibArg { int k; long long result; } và hàm void *worker(void *arg) gọi fib_memo(fa->k).",
        "Bước 4: Trong main(), đọc n, đổ -1 vào memo[0..95], gán memo[0] = 0, memo[1] = 1; nếu n <= 1 in ngay và return 0.",
        "Bước 5: Tạo 2 biến FibArg riêng cho n - 1 và n - 2, gọi pthread_create cho t1, t2, sau đó pthread_join cả hai rồi printf(\"%lld\\n\", a1.result + a2.result)."
      ]
    }
  },
  {
    "num": 42,
    "id": "CR-42",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (File + Process + Pipe)",
    "difficulty": "Trung bình",
    "title": "Tiến trình con đọc tệp số nguyên bằng System Call và gửi tổng qua pipe()",
    "staticSummary": "Sandbox tự tạo tệp văn bản; kiểm tra tĩnh fork, pipe, waitpid, open, read, close",
    "prompt": "Tiến trình cha đọc tên tệp file_path từ stdin, tạo một ống pipe() và gọi fork() sinh 1 tiến trình con. Tiến trình con mở tệp bằng system call open(..., O_RDONLY), đọc toàn bộ dữ liệu bằng read(), phân tích các số nguyên (có thể âm hoặc dương, phân tách bởi khoảng trắng/xuống dòng), tính tổng các số nguyên dương (> 0), đóng tệp bằng close() và gửi tổng kiểu long long về tiến trình cha qua pipe (nếu không mở được tệp thì gửi -1). Tiến trình cha nhận kết quả từ ống, thu gom con bằng waitpid() và in kết quả.",
    "requirements": [
      "Sử dụng <fcntl.h>, <unistd.h>, <sys/wait.h>.",
      "Bắt buộc dùng fork(), pipe(), waitpid() và các system call open(), read(), close() để đọc tệp ở tiến trình con.",
      "Không dùng fopen, fscanf, fgets để đọc file_path.",
      "Đóng đúng các đầu ống không sử dụng ở cả cha và con."
    ],
    "inputSpec": "Một dòng chứa tên tệp file_path.",
    "outputSpec": "Một số nguyên (long long) là tổng các số nguyên dương trong tệp (hoặc -1 nếu lỗi mở tệp).",
    "constraints": [
      "Độ dài file_path <= 128 ký tự",
      "0 <= kích thước tệp <= 10^6 byte, mỗi số nguyên trong [-10^6, 10^6]"
    ],
    "example": {
      "note": "Tệp p42.txt chứa \"10 -4 25\\n0 -9 5\\n\" -> tổng các số dương là 10 + 25 + 5 = 40.",
      "input": "p42.txt",
      "output": "40"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Phân tích số nguyên trực tiếp trên dòng byte của read()"
      },
      {
        "id": "3-8",
        "label": "3.8 Gửi kết quả nhị phân từ tiến trình con về cha qua pipe()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khi đọc tệp văn bản lớn theo từng khối buf[8192] bằng read(), một con số nhiều chữ số (như \"12345\") có thể bị cắt ngang ranh giới hai lần gọi read()! Dùng máy trạng thái 3 biến (in_num, sign, cur) giữ trạng thái xuyên qua các khối buffer xử lý chính xác 100% mà không tốn bộ nhớ nạp cả tệp.",
    "relatedQuestions": [
      "CR-01",
      "CR-10",
      "CR-44"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    char path[256];\n    scanf(\"%s\", path);\n\n    int p[2];\n    pipe(p);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        close(p[0]);\n        int fd = open(path, O_RDONLY);\n        long long sum = 0;\n\n        if (fd < 0) {\n            sum = -1;\n        } else {\n            char buf[4096];\n            ssize_t n;\n            long long num = 0;\n            int in_num = 0, neg = 0;\n\n            while ((n = read(fd, buf, sizeof(buf))) > 0) {\n                for (ssize_t i = 0; i < n; i++) {\n                    char c = buf[i];\n                    if (c == '-' && !in_num) {\n                        neg = 1;\n                        in_num = 1;\n                        num = 0;\n                    } else if (c >= '0' && c <= '9') {\n                        if (!in_num) {\n                            in_num = 1;\n                            neg = 0;\n                            num = 0;\n                        }\n                        num = num * 10 + (c - '0');\n                    } else {\n                        if (in_num) {\n                            long long val = neg ? -num : num;\n                            if (val > 0) sum += val;\n                            in_num = 0;\n                            neg = 0;\n                            num = 0;\n                        }\n                    }\n                }\n            }\n            if (in_num) {\n                long long val = neg ? -num : num;\n                if (val > 0) sum += val;\n            }\n            close(fd);\n        }\n\n        write(p[1], &sum, sizeof(sum));\n        close(p[1]);\n        _exit(0);\n    } else {\n        close(p[1]);\n        long long ans = -1;\n        read(p[0], &ans, sizeof(ans));\n        close(p[0]);\n        waitpid(pid, NULL, 0);\n        printf(\"%lld\\n\", ans);\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Bộ phân tích số nguyên theo luồng trạng thái (streaming state machine) xử lý liền mạch ngay cả khi một số nguyên nằm vắt ngang hai lần gọi read() và không bỏ sót số cuối cùng ở sát EOF."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "fcntl.h",
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "pipe",
        "fork",
        "waitpid",
        "open",
        "read",
        "close",
        "O_RDONLY"
      ],
      "forbiddenApis": [
        "fopen",
        "fscanf",
        "fgets",
        "fread"
      ],
      "qualityRules": [
        {
          "desc": "Gửi -1 về cha nếu open() thất bại",
          "regex": "-\\s*1",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 (System Call vào/ra tệp mức thấp — Mục 2.5) + Chương 3 (Tiến trình fork(), giao tiếp IPC qua pipe() và waitpid() — Mục 3.8). Bài toán tổng hợp chuẩn mực giữa đọc luồng byte thô và truyền dữ liệu nhị phân giữa tiến trình con và cha.",
      "idea": {
        "summary": "Tiến trình cha nhận tên tệp từ stdin, mở một đường ống giao tiếp một chiều pipe() rồi gọi fork() tạo 1 tiến trình con. Tiến trình con dùng system call open(..., O_RDONLY) và read() đọc tệp theo từng khối 4 KB, chạy một máy trạng thái nhỏ duyệt từng ký tự để ghép các số nguyên (kể cả số âm hay số bị cắt đôi ngay ranh giới 4096 byte) và chỉ cộng các số > 0. Cuối cùng con gửi tổng kiểu long long (hoặc -1 nếu mở tệp thất bại) qua pipe về cha; cha đọc kết quả, thu dọn con bằng waitpid() để chống Zombie rồi in đáp án.",
        "steps": [
          "Bước 1 — Khởi tạo IPC trước khi nhân bản: Cha đọc đường dẫn path từ stdin, gọi pipe(p) tạo cặp FD (p[0] đọc, p[1] ghi) rồi mới gọi fork() để cha và con dùng chung đường ống.",
          "Bước 2 — Đóng đầu ống thừa ở mỗi tiến trình: Con chỉ ghi nên gọi close(p[0]) ngay; cha chỉ đọc nên gọi close(p[1]) ngay — quy tắc vàng của pipe giúp phát hiện EOF chuẩn xác và không rò rỉ FD.",
          "Bước 3 — Tiến trình con mở tệp bằng system call: Gọi open(path, O_RDONLY). Nếu trả về < 0 (tệp không tồn tại hoặc không có quyền đọc), đặt sum = -1 để báo lỗi về cha.",
          "Bước 4 — Đọc khối 4 KB & tách số bằng máy trạng thái: Lặp while ((n = read(fd, buf, 4096)) > 0), duyệt từng ký tự với 3 biến trạng thái (num, in_num, neg) để ghép trọn vẹn số nguyên dương/âm kể cả khi một số nằm vắt ngang hai lần read().",
          "Bước 5 — Chốt số cuối tệp & gửi qua pipe: Sau vòng while, kiểm tra if (in_num) để không bỏ sót số nằm sát cuối tệp (EOF không có '\\n'), gọi close(fd), ghi đúng sizeof(sum) byte vào p[1], đóng p[1] và kết thúc con bằng _exit(0).",
          "Bước 6 — Tiến trình cha nhận kết quả & thu dọn Zombie: Cha đọc ans từ p[0], đóng p[0], gọi waitpid(pid, NULL, 0) thu gom tiến trình con rồi in ans."
        ],
        "whyThisWay": "Đề bài cấm tuyệt đối fopen/fscanf nên ta bắt buộc dùng open/read/close. Nếu cố đọc cả tệp vào một mảng cố định sẽ có thể tràn bộ nhớ với tệp lớn, còn nếu tách số bằng sscanf từng khối 4 KB thì một số nguyên nằm ở ranh giới byte 4095–4096 sẽ bị chẻ làm hai số sai! Máy trạng thái duyệt từng ký tự vừa tốn đúng 4 KB RAM cố định O(1), vừa ghép số chính xác 100% ở mọi ranh giới khối. Dùng _exit(0) ở tiến trình con tránh xả trùng bộ đệm stdio của tiến trình cha.",
        "complexity": "Thời gian: O(S) với S là số byte của tệp · Bộ nhớ: O(1) (buffer tĩnh 4096 byte) · Tài nguyên OS: 1 tiến trình con + 1 pipe (2 FD) + 1 file FD"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–8",
          "title": "Khai báo thư viện hệ thống & đọc đường dẫn tệp từ stdin",
          "code": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/wait.h>\nchar path[256]; scanf(\"%s\", path);",
          "explain": "Nạp <fcntl.h> (chứa hàm open và cờ O_RDONLY), <unistd.h> (chứa pipe, fork, read, write, close, _exit) và <sys/wait.h> (chứa waitpid). Đường dẫn tệp tối đa 128 ký tự nên mảng char path[256] đủ rộng an toàn; ta đọc path bằng scanf(\"%s\", path) trước khi fork() để tiến trình con tự động kế thừa bản sao của chuỗi path."
        },
        {
          "lines": "Dòng 10–17",
          "title": "Tạo pipe(), gọi fork() & nhánh con mở tệp bằng open()",
          "code": "int p[2]; pipe(p);\npid_t pid = fork();\nif (pid == 0) {\n    close(p[0]);\n    int fd = open(path, O_RDONLY);\n    long long sum = 0;",
          "explain": "BẮT BUỘC gọi pipe(p) TRƯỚC fork() để tiến trình con thừa hưởng cùng cặp file descriptor trỏ tới một ống kernel duy nhất (p[0] là đầu đọc, p[1] là đầu ghi). Trong nhánh con (pid == 0), gọi ngay close(p[0]) vì con chỉ ghi. Mở tệp bằng open(path, O_RDONLY) (chỉ đọc) và dùng long long sum = 0 để tránh tràn số khi cộng nhiều số nguyên tới 10^6."
        },
        {
          "lines": "Dòng 19–25",
          "title": "Xử lý lỗi mở tệp & khởi tạo biến máy trạng thái",
          "code": "if (fd < 0) { sum = -1; } else {\n    char buf[4096]; ssize_t n;\n    long long num = 0; int in_num = 0, neg = 0;",
          "explain": "System call open() trả về -1 khi tệp không tồn tại hoặc không có quyền đọc; lúc này đặt sum = -1 rồi nhảy thẳng xuống bước gửi qua pipe. Nếu mở thành công, cấp phát bộ đệm 4096 byte (1 trang bộ nhớ tối ưu cho hệ điều hành), dùng ssize_t (kiểu có dấu) cho giá trị trả về của read() vì read() có thể trả về -1 khi lỗi. Ba biến trạng thái: num tích lũy trị tuyệt đối, in_num báo đang đọc dở một số, neg báo số đó có dấu âm '-'."
        },
        {
          "lines": "Dòng 27–34",
          "title": "Đọc từng khối 4 KB & nhận diện dấu âm '-'",
          "code": "while ((n = read(fd, buf, sizeof(buf))) > 0) {\n    for (ssize_t i = 0; i < n; i++) {\n        char c = buf[i];\n        if (c == '-' && !in_num) { neg = 1; in_num = 1; num = 0; }",
          "explain": "Vòng while đọc liên tiếp tối đa 4096 byte mỗi lần cho tới khi read() trả về 0 (hết tệp — EOF). Duyệt đúng n byte thực đọc được (không dùng strlen vì buf không kết thúc bằng '\\0'). Khi gặp ký tự '-' ở trạng thái chưa nằm trong số (!in_num), bật cờ neg = 1, in_num = 1 và đặt lại num = 0 để chuẩn bị đón các chữ số tiếp theo."
        },
        {
          "lines": "Dòng 35–51",
          "title": "Ghép chữ số '0'..'9' & chốt số khi gặp ký tự phân tách",
          "code": "} else if (c >= '0' && c <= '9') {\n    if (!in_num) { in_num = 1; neg = 0; num = 0; }\n    num = num * 10 + (c - '0');\n} else {\n    if (in_num) { long long val = neg ? -num : num; if (val > 0) sum += val; in_num = 0; neg = 0; num = 0; }\n}",
          "explain": "Khi gặp chữ số từ '0' đến '9': nếu mới bắt đầu một số dương (!in_num) thì bật in_num = 1, neg = 0, num = 0; sau đó nhân 10 cộng giá trị chữ số (c - '0'). Khi gặp bất kỳ ký tự phân tách nào (dấu cách, '\\n', '\\r', '\\t'...), nếu đang đọc dở số (in_num == 1) thì gắn lại dấu âm/dương thành val, chỉ cộng vào sum khi val > 0 (đúng yêu cầu 'tổng các số nguyên dương'), rồi reset cả 3 biến trạng thái về 0."
        },
        {
          "lines": "Dòng 52–61",
          "title": "Chốt số cuối tệp, đóng tệp, gửi kết quả qua pipe & _exit(0)",
          "code": "if (in_num) { long long val = neg ? -num : num; if (val > 0) sum += val; }\nclose(fd);\nwrite(p[1], &sum, sizeof(sum));\nclose(p[1]);\n_exit(0);",
          "explain": "CỰC KỲ DỄ QUÊN: nếu tệp kết thúc ngay sau một chữ số (ví dụ \"12 8\" không có '\\n' cuối tệp), vòng while thoát ra khi in_num vẫn bằng 1 nên số 8 chưa được cộng! Khối if (in_num) ở dòng 52–55 chốt nốt số cuối cùng này. Tiếp đó đóng tệp bằng close(fd), ghi nhị phân trọn vẹn 8 byte của biến sum vào đầu ghi p[1], đóng p[1] và thoát tiến trình con bằng _exit(0) (không dùng exit(0) để tránh xả đúp buffer stdio)."
        },
        {
          "lines": "Dòng 62–71",
          "title": "Nhánh tiến trình cha đọc pipe, waitpid() & in kết quả",
          "code": "} else {\n    close(p[1]);\n    long long ans = -1;\n    read(p[0], &ans, sizeof(ans));\n    close(p[0]);\n    waitpid(pid, NULL, 0);\n    printf(\"%lld\\n\", ans);\n}",
          "explain": "Ở tiến trình cha (pid > 0), đóng ngay đầu ghi p[1] (nếu quên đóng p[1], cha có thể bị treo vô hạn khi chờ EOF trên ống). Gọi read(p[0], &ans, sizeof(ans)) sẽ tự động chặn (block) cho đến khi con ghi xong 8 byte của sum, đảm bảo đồng bộ tự nhiên. Sau khi đóng p[0], gọi waitpid(pid, NULL, 0) để thu dọn tiến trình con (tránh tạo Zombie process) rồi in ans bằng %lld."
        }
      ],
      "testCases": [
        {
          "name": "Hỗn hợp số dương, số âm và số 0",
          "caseDesc": "Tệp chứa \"10 -4 25\\n0 -9 5\".",
          "howHandled": "Máy trạng thái đọc từng số: -4, 0, -9 không thỏa val > 0 nên bị bỏ qua; chỉ cộng 10 + 25 + 5 = 40."
        },
        {
          "name": "Tệp không có ký tự xuống dòng ở cuối (EOF sát chữ số)",
          "caseDesc": "Tệp chỉ chứa \"12 8\" (không có '\\n' cuối cùng).",
          "howHandled": "Khối if (in_num) ngay sau vòng while đọc tệp kịp thời chốt số 8, cho tổng 12 + 8 = 20 thay vì bị mất số cuối."
        },
        {
          "name": "Số nguyên bị cắt ngang ranh giới buffer 4096 byte",
          "caseDesc": "Tệp lớn có số \"123456\" với \"123\" nằm ở cuối khối 1 và \"456\" nằm ở đầu khối 2.",
          "howHandled": "Các biến trạng thái num, in_num, neg giữ nguyên giá trị giữa các lần gọi read(), ghép trọn vẹn thành 123456."
        },
        {
          "name": "Tệp không tồn tại hoặc tệp rỗng 0 byte",
          "caseDesc": "missing.txt → -1; empty.txt (0 byte) → 0.",
          "howHandled": "Tệp thiếu khiến open() < 0 → con gửi sum = -1; tệp rỗng mở thành công nhưng read() trả về 0 ngay → con gửi sum = 0."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp <stdio.h>, <fcntl.h>, <unistd.h>, <sys/wait.h>; đọc path từ stdin.",
        "Bước 2: Gọi pipe(p) TRƯỚC fork(). Ngay đầu nhánh con gọi close(p[0]), ngay đầu nhánh cha gọi close(p[1]).",
        "Bước 3: Trong con: open(path, O_RDONLY). Nếu fd < 0 đặt sum = -1; ngược lại dùng buffer 4096 byte + máy trạng thái (num, in_num, neg) đọc từng ký tự và chỉ cộng val > 0.",
        "Bước 4: Sau vòng while trong con, nhớ viết khối if (in_num) để chốt số cuối tệp, rồi close(fd), write(p[1], &sum, sizeof(sum)), close(p[1]), _exit(0).",
        "Bước 5: Trong cha: read(p[0], &ans, sizeof(ans)), close(p[0]), waitpid(pid, NULL, 0), rồi printf(\"%lld\\n\", ans)."
      ]
    }
  },
  {
    "num": 43,
    "id": "CR-43",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (File + Thread)",
    "difficulty": "Trung bình",
    "title": "Đếm byte mục tiêu trong tệp song song bằng T luồng với lseek()",
    "staticSummary": "Biên dịch với -pthread; sandbox tự tạo tệp; kiểm tra tĩnh pthread_create, pthread_join, stat, open, lseek, read, close",
    "prompt": "Cho đường dẫn tệp file_path, giá trị byte mục tiêu target_byte (0..255) và số luồng T. Luồng chính gọi stat() xác định tổng kích thước tệp (nếu stat() thất bại hoặc không mở được tệp thì in -1; nếu size == 0 in 0). Chia phạm vi byte [0, size) thành T đoạn liên tiếp cho T luồng. Mỗi luồng tự mở một file descriptor riêng với open(..., O_RDONLY) (tránh dùng chung con trỏ vị trí tệp gây xung đột giữa các luồng), dùng lseek(..., start, SEEK_SET) định vị, đọc đúng số byte được giao bằng read() rồi đóng close(), đếm số byte có giá trị unsigned char bằng target_byte và tổng hợp kết quả tại luồng chính.",
    "requirements": [
      "Sử dụng <pthread.h>, <fcntl.h>, <unistd.h>, <sys/stat.h>.",
      "Mỗi luồng phải mở file descriptor riêng và định vị bằng lseek(..., SEEK_SET) trước khi read().",
      "Không dùng pread không chuẩn hoá hoặc chia sẻ cùng một fd giữa nhiều luồng với lseek() (sẽ gây race condition trên file offset).",
      "Không dùng fopen, fread; đếm cục bộ rồi cộng hợp hoặc đồng bộ mutex."
    ],
    "inputSpec": "Một dòng chứa: file_path target_byte T.",
    "outputSpec": "Một số nguyên (long long) là số lần xuất hiện của target_byte trong tệp (hoặc -1 nếu lỗi mở tệp).",
    "constraints": [
      "Độ dài file_path <= 128 ký tự",
      "0 <= target_byte <= 255",
      "1 <= T <= 8",
      "0 <= kích thước tệp <= 5 * 10^6 byte"
    ],
    "example": {
      "note": "Tệp 10 byte chứa 5 byte có mã 65 (0x41 = 'A').",
      "input": "f43.bin 65 4",
      "output": "5"
    },
    "relatedTopics": [
      {
        "id": "2-4",
        "label": "2.4 Gọi open() độc lập tạo Open File Table Entry & Offset riêng"
      },
      {
        "id": "2-6",
        "label": "2.6 Xung đột File Offset nếu nhiều luồng dùng chung 1 fd"
      },
      {
        "id": "4-1",
        "label": "4.1 Các luồng trong cùng tiến trình chia sẻ chung Bảng FD"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Các luồng trong cùng một tiến trình chia sẻ chung Bảng File Descriptor! Nếu mở 1 fd duy nhất ở main rồi các luồng cùng gọi lseek(fd) + read(fd), chúng sẽ giật con trỏ vị trí tệp của nhau gây đọc sai hoàn toàn. Ngược lại, mỗi luồng tự gọi open() sẽ tạo ra một mục Open File Description độc lập trong nhân với con trỏ offset riêng!",
    "relatedQuestions": [
      "CR-01",
      "CR-04",
      "CR-48"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n#include <pthread.h>\n\nchar file_path[256];\nint target_byte, T;\noff_t file_size;\nlong long counts[16];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    off_t base = file_size / T;\n    off_t rem = file_size % T;\n    off_t start = tid * base + (tid < rem ? tid : rem);\n    off_t len = base + (tid < rem ? 1 : 0);\n\n    int fd = open(file_path, O_RDONLY);\n    if (fd < 0) {\n        counts[tid] = 0;\n        return NULL;\n    }\n\n    lseek(fd, start, SEEK_SET);\n    unsigned char buf[4096];\n    long long local_cnt = 0;\n    off_t remain = len;\n\n    while (remain > 0) {\n        size_t chunk = (remain < (off_t)sizeof(buf)) ? (size_t)remain : sizeof(buf);\n        ssize_t n = read(fd, buf, chunk);\n        if (n <= 0) break;\n        for (ssize_t i = 0; i < n; i++) {\n            if (buf[i] == (unsigned char)target_byte) local_cnt++;\n        }\n        remain -= n;\n    }\n\n    close(fd);\n    counts[tid] = local_cnt;\n    return NULL;\n}\n\nint main() {\n    scanf(\"%s %d %d\", file_path, &target_byte, &T);\n\n    struct stat st;\n    if (stat(file_path, &st) < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n    int test_fd = open(file_path, O_RDONLY);\n    if (test_fd < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n    close(test_fd);\n\n    file_size = st.st_size;\n    if (file_size == 0) {\n        printf(\"0\\n\");\n        return 0;\n    }\n\n    pthread_t th[16];\n    int ids[16];\n    for (int i = 0; i < T; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < T; i++) pthread_join(th[i], NULL);\n\n    long long total = 0;\n    for (int i = 0; i < T; i++) total += counts[i];\n    printf(\"%lld\\n\", total);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Kiểm tra trước cả stat() lẫn quyền đọc thực tế bằng open() (phòng trường hợp tệp tồn tại nhưng quyền 0000 không đọc được).",
      "Mỗi luồng mở fd riêng, nhảy chính xác tới t->start bằng lseek(SEEK_SET) và đọc đúng t->len byte không lấn sang đoạn của luồng kế tiếp."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h",
        "fcntl.h",
        "unistd.h",
        "sys/stat.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "stat",
        "open",
        "lseek",
        "read",
        "close",
        "SEEK_SET"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "pread"
      ],
      "qualityRules": [
        {
          "desc": "Mỗi luồng tự gọi open() bên trong hàm worker tránh chung file offset",
          "regex": "void\\s*\\*\\s*\\w+\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\bopen\\s*\\(",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 (System Call stat(), open(), lseek(), read() — Mục 2.6) + Chương 4 (Phân hoạch tĩnh đa luồng & Cô lập File Descriptor — Mục 4.1). Bài toán điển hình về xử lý tệp nhị phân song song an toàn mà không dính race condition trên con trỏ offset của tệp.",
      "idea": {
        "summary": "Để đếm số lần xuất hiện của một byte mục tiêu (0..255) trong tệp lớn bằng T luồng, luồng chính trước hết gọi stat() để biết tổng kích thước file_size và kiểm tra quyền mở tệp. Sau đó chia đoạn byte [0, file_size) thành T đoạn liên tiếp cân bằng nhau. Điểm mấu chốt của hệ điều hành Linux: mỗi luồng BẮT BUỘC tự gọi open() để nhận một File Descriptor (và bảng Open File Entry / con trỏ offset) hoàn toàn riêng biệt, rồi lseek() tới đầu đoạn được giao, đọc đúng số byte len cần xử lý, đếm cục bộ vào counts[tid] mà không cần mutex.",
        "steps": [
          "Bước 1 — Kiểm tra tệp & lấy kích thước ở luồng chính: Đọc file_path, target_byte, T. Gọi stat() kiểm tra tồn tại + lấy st.st_size và thử open()/close() xác nhận quyền đọc; lỗi thì in -1, nếu file_size == 0 in 0 ngay.",
          "Bước 2 — Phân hoạch tĩnh [start, start + len): Với mỗi luồng tid (0..T-1), tính base = file_size / T và rem = file_size % T; rem luồng đầu nhận base + 1 byte, các luồng sau nhận base byte để không bỏ sót hay chồng lấn bất kỳ byte nào.",
          "Bước 3 — Cô lập File Descriptor bằng open() riêng trong mỗi luồng: Mỗi luồng tự mở open(file_path, O_RDONLY) để sở hữu con trỏ vị trí tệp (file offset) độc lập với mọi luồng khác, rồi gọi lseek(fd, start, SEEK_SET).",
          "Bước 4 — Đọc chính xác len byte dạng unsigned char: Lặp khi remain > 0, mỗi lần chỉ đọc chunk = min(remain, 4096) byte vào mảng unsigned char buf[4096], đếm các byte khớp (unsigned char)target_byte vào biến cục bộ local_cnt.",
          "Bước 5 — Tổng hợp không cần mutex: Mỗi luồng đóng close(fd) và ghi local_cnt vào ô riêng counts[tid]; sau khi pthread_join() đủ T luồng, luồng chính cộng tổng counts[0..T-1] và in ra stdout."
        ],
        "whyThisWay": "Trong Linux, tất cả các luồng trong cùng một tiến trình chia sẻ chung bảng File Descriptor. Nếu mở 1 fd duy nhất ở main() rồi cho T luồng cùng gọi lseek(fd, ...) và read(fd, ...), luồng B sẽ kéo lệch con trỏ offset ngay giữa lúc luồng A vừa lseek xong và sắp read — gây race condition nghiêm trọng làm sai kết quả! Tự gọi open() trong từng luồng tạo ra T Open File Table Entry riêng biệt trong nhân hệ điều hành nên T con trỏ vị trí hoàn toàn độc lập. Đồng thời dùng unsigned char bảo đảm các byte ≥ 128 (như 0xFF = 255) không bị hiểu nhầm thành số âm (-1).",
        "complexity": "Thời gian: O(S / T) (đọc song song toàn tệp S byte trên T luồng) · Bộ nhớ: O(T) (mỗi luồng 4 KB buffer trên stack) · Tài nguyên OS: T luồng POSIX + T File Descriptor độc lập"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–10",
          "title": "Khai báo thư viện hệ thống & dữ liệu toàn cục dùng chung",
          "code": "#include <sys/stat.h>\n#include <pthread.h>\nchar file_path[256];\nint target_byte, T;\noff_t file_size;\nlong long counts[16];",
          "explain": "Nạp <fcntl.h>, <unistd.h>, <sys/stat.h> cho stat/open/lseek/read/close và <pthread.h> cho luồng POSIX. Các tham số chỉ đọc (file_path, target_byte, T, file_size) đặt toàn cục để mọi luồng đều truy cập được. Kiểu off_t là kiểu chuẩn POSIX cho kích thước và vị trí (offset) tệp. Mảng counts[16] đủ cho T ≤ 8, mỗi luồng chỉ ghi vào đúng một ô counts[tid] nên không cần mutex."
        },
        {
          "lines": "Dòng 12–17",
          "title": "Phân hoạch tĩnh phạm vi byte [start, start + len) cho từng luồng",
          "code": "int tid = *(int *)arg;\noff_t base = file_size / T;\noff_t rem = file_size % T;\noff_t start = tid * base + (tid < rem ? tid : rem);\noff_t len = base + (tid < rem ? 1 : 0);",
          "explain": "Giải tham chiếu *(int *)arg lấy mã số luồng tid (0..T-1). Công thức chia đều số dư: rem luồng đầu tiên (tid < rem) mỗi luồng gánh thêm 1 byte nên điểm bắt đầu dịch thêm tid byte và độ dài là base + 1; các luồng sau (tid >= rem) bắt đầu sau đúng rem byte dư và có độ dài base. Nhờ công thức này, ngay cả khi file_size < T, các luồng dư ra chỉ có len = 0 và không bao giờ đọc tràn quá cuối tệp."
        },
        {
          "lines": "Dòng 19–28",
          "title": "Mỗi luồng tự mở FD riêng & định vị bằng lseek(..., SEEK_SET)",
          "code": "int fd = open(file_path, O_RDONLY);\nif (fd < 0) { counts[tid] = 0; return NULL; }\nlseek(fd, start, SEEK_SET);\nunsigned char buf[4096];\nlong long local_cnt = 0;\noff_t remain = len;",
          "explain": "Mỗi luồng tự gọi open(file_path, O_RDONLY) để hệ điều hành cấp một Open File Description riêng kèm file offset độc lập. Sau đó gọi lseek(fd, start, SEEK_SET) để nhảy chính xác đến byte thứ start tính từ đầu tệp (SEEK_SET). Bộ đệm buf bắt buộc khai báo unsigned char (miền 0..255) thay vì char có dấu (-128..127), biến đếm local_cnt đặt trên stack để tránh xung đột bộ nhớ đệm (false sharing) giữa các lõi CPU."
        },
        {
          "lines": "Dòng 30–38",
          "title": "Đọc đúng remain byte được giao & đếm byte khớp mục tiêu",
          "code": "while (remain > 0) {\n    size_t chunk = (remain < (off_t)sizeof(buf)) ? (size_t)remain : sizeof(buf);\n    ssize_t n = read(fd, buf, chunk);\n    if (n <= 0) break;\n    for (ssize_t i = 0; i < n; i++) {\n        if (buf[i] == (unsigned char)target_byte) local_cnt++;\n    }\n    remain -= n;\n}",
          "explain": "Điểm cực kỳ quan trọng: tham số thứ 3 của read() phải là chunk = min(remain, 4096) chứ KHÔNG được truyền cứng 4096! Nếu truyền cứng 4096 khi remain chỉ còn 100 byte, luồng sẽ đọc lấn 3996 byte sang phần việc của luồng kế tiếp và đếm đúp. So sánh buf[i] == (unsigned char)target_byte chính xác tuyệt đối với mọi byte nhị phân kể cả 0x00 ('\\0') và 0xFF (255). Sau mỗi lần đọc, giảm remain đi đúng n byte thực đọc."
        },
        {
          "lines": "Dòng 40–43",
          "title": "Đóng File Descriptor & ghi kết quả vào ô counts[tid]",
          "code": "close(fd);\ncounts[tid] = local_cnt;\nreturn NULL;",
          "explain": "Luôn gọi close(fd) trước khi thoát luồng để trả lại File Descriptor cho hệ điều hành (tránh rò rỉ FD khi chạy nhiều lần). Ghi tổng cục bộ local_cnt vào ô counts[tid] đúng 1 lần duy nhất rồi trả về NULL."
        },
        {
          "lines": "Dòng 45–64",
          "title": "Kiểm tra lỗi bằng stat() + open() & xử lý tệp rỗng",
          "code": "if (stat(file_path, &st) < 0) { printf(\"-1\\n\"); return 0; }\nint test_fd = open(file_path, O_RDONLY);\nif (test_fd < 0) { printf(\"-1\\n\"); return 0; }\nclose(test_fd);\nfile_size = st.st_size;\nif (file_size == 0) { printf(\"0\\n\"); return 0; }",
          "explain": "Đầu tiên gọi stat(file_path, &st) để kiểm tra tệp tồn tại và lấy tổng số byte st.st_size. Tuy nhiên một tệp có thể tồn tại (stat thành công) nhưng bị cấm quyền đọc (chmod 000)! Do đó bước mở thử test_fd = open(file_path, O_RDONLY) rồi close(test_fd) ngay đảm bảo bắt trọn mọi lỗi quyền truy cập và in -1 chính xác. Nếu tệp hợp lệ nhưng rỗng (file_size == 0), in 0 và thoát ngay không cần khởi tạo luồng."
        },
        {
          "lines": "Dòng 66–78",
          "title": "Khởi tạo T luồng, chờ pthread_join() & in tổng toàn tệp",
          "code": "for (int i = 0; i < T; i++) {\n    ids[i] = i;\n    pthread_create(&th[i], NULL, worker, &ids[i]);\n}\nfor (int i = 0; i < T; i++) pthread_join(th[i], NULL);\nlong long total = 0;\nfor (int i = 0; i < T; i++) total += counts[i];",
          "explain": "Lưu chỉ số từng luồng vào mảng riêng ids[i] rồi truyền địa chỉ &ids[i] vào pthread_create() — tuyệt đối KHÔNG truyền &i vì biến i thay đổi liên tục trong vòng for sẽ làm các luồng đọc sai tid! Sau khi gọi pthread_join() cho cả T luồng để bảo đảm mọi ô counts[i] đã sẵn sàng, luồng chính cộng dồn vào total kiểu long long và in ra stdout."
        }
      ],
      "testCases": [
        {
          "name": "Tệp nhị phân chứa byte đặc biệt (0x00 và 0xFF)",
          "caseDesc": "Tệp chứa lẫn ký tự 'A' (65), byte NULL 0x00 (0) và 0xFF (255) với T = 4.",
          "howHandled": "Vì đọc theo độ dài byte n của read() và dùng mảng unsigned char, cả byte 0x00 không làm đứt chuỗi lẫn byte 0xFF = 255 không bị biến thành -1 đều được đếm chính xác 100%."
        },
        {
          "name": "Tệp nhỏ hơn số luồng (file_size < T)",
          "caseDesc": "Tệp dài 3 byte nhưng T = 8 luồng.",
          "howHandled": "base = 0, rem = 3: 3 luồng đầu đọc mỗi luồng 1 byte (len = 1), 5 luồng còn lại có len = 0 nên bỏ qua vòng while (remain > 0) an toàn và trả về 0."
        },
        {
          "name": "Tệp rỗng 0 byte",
          "caseDesc": "empty.bin 65 4.",
          "howHandled": "stat() và open() thành công với st.st_size == 0 → nhánh if (file_size == 0) in 0 và thoát ngay."
        },
        {
          "name": "Tệp không tồn tại hoặc không có quyền đọc",
          "caseDesc": "missing.bin 65 4 hoặc tệp chmod 000.",
          "howHandled": "stat() < 0 hoặc test_fd = open() < 0 → in ngay -1 mà không tạo luồng."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo toàn cục file_path[256], target_byte, T, off_t file_size và long long counts[16].",
        "Bước 2: Trong main(), đọc tham số; kiểm tra cả stat(file_path, &st) < 0 lẫn mở thử open(..., O_RDONLY) < 0 → in -1; nếu file_size == 0 in 0 và return 0.",
        "Bước 3: Viết worker(): tính đoạn [start, start + len) bằng base = file_size / T, rem = file_size % T.",
        "Bước 4: Trong worker(): TỰ gọi open(file_path, O_RDONLY), lseek(fd, start, SEEK_SET), đọc vòng while (remain > 0) với chunk = min(remain, 4096) vào unsigned char buf[4096], đếm local_cnt, close(fd) và lưu counts[tid].",
        "Bước 5: Luồng chính tạo T luồng với mảng ids[16] riêng, pthread_join() đủ T luồng rồi cộng counts[0..T-1] và in bằng %lld."
      ]
    }
  },
  {
    "num": 44,
    "id": "CR-44",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (File + DP)",
    "difficulty": "Trung bình",
    "title": "Đọc dữ liệu Balo 0/1 từ tệp bằng System Call, giải DP và ghi ra tệp đích",
    "staticSummary": "Kiểm tra cả nội dung tệp đích lẫn stdout; kiểm tra tĩnh open, read, write, close (cấm stdio file)",
    "prompt": "Cho tên tệp nguồn src_path và tên tệp đích dst_path trên stdin. Chương trình phải dùng system call mức thấp (open, read, close) để đọc toàn bộ nội dung bài toán Balo 0/1 từ src_path (gồm dòng 1: n W; n dòng tiếp theo: w_i v_i). Giải bài toán bằng Quy hoạch động để tìm tổng giá trị lớn nhất ans. Sau đó mở dst_path (O_WRONLY | O_CREAT | O_TRUNC, quyền 0644), ghi kết quả ans dạng chuỗi thập phân kèm ký tự xuống dòng '\\n' bằng write(), đóng tệp và in ans ra stdout. Nếu không mở được src_path, chỉ in -1.",
    "requirements": [
      "Sử dụng <fcntl.h>, <unistd.h>, <sys/stat.h>.",
      "Bắt buộc dùng open(), read(), write(), close() cho src_path và dst_path; cấm fopen, fscanf, fprintf, fread, fwrite.",
      "Giải bài toán 0/1 Knapsack bằng Quy hoạch động.",
      "Chương trình in đúng ans ra stdout và tệp dst_path chứa chính xác \"<ans>\\n\"."
    ],
    "inputSpec": "Một dòng gồm: src_path dst_path.",
    "outputSpec": "Một số nguyên (long long) là giá trị tối đa trên stdout (tệp dst_path chứa <ans>\\n).",
    "constraints": [
      "1 <= n <= 200",
      "0 <= W <= 10^4",
      "1 <= w_i <= 10^4, 0 <= v_i <= 10^6"
    ],
    "example": {
      "note": "Chọn vật (3, 4) và (4, 5) cho tổng khối lượng 7 và giá trị 9; cả stdout lẫn ks44_out.txt đều mang giá trị 9.",
      "input": "ks44_in.txt ks44_out.txt",
      "output": "9"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Đọc và định dạng số nguyên bằng System Call thuần"
      },
      {
        "id": "7-11",
        "label": "7.11 Quy hoạch động Balo 0/1"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khi bị cấm hoàn toàn fopen / fscanf / fprintf trên tệp, cách viết ngắn gọn và sạch nhất trong phòng thi là: nạp nội dung tệp văn bản vào mảng nhớ bằng vòng lặp read(), dùng hàm con next_ll(&ptr) tách từng số nguyên, giải DP, rồi chuyển kết quả sang chuỗi \"<ans>\\n\" để ghi bằng write().",
    "relatedQuestions": [
      "CR-02",
      "CR-37",
      "CR-50"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n\nlong long dp[10005];\n\nlong long next_ll(const char *s, int *pos, int len) {\n    while (*pos < len && (s[*pos] == ' ' || s[*pos] == '\\n' || s[*pos] == '\\r' || s[*pos] == '\\t')) {\n        (*pos)++;\n    }\n    int neg = 0;\n    if (*pos < len && s[*pos] == '-') { neg = 1; (*pos)++; }\n    long long val = 0;\n    while (*pos < len && s[*pos] >= '0' && s[*pos] <= '9') {\n        val = val * 10 + (s[*pos] - '0');\n        (*pos)++;\n    }\n    return neg ? -val : val;\n}\n\nint main() {\n    char src[256], dst[256];\n    scanf(\"%s %s\", src, dst);\n\n    int fd_in = open(src, O_RDONLY);\n    if (fd_in < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    struct stat st;\n    fstat(fd_in, &st);\n    int len = (int)st.st_size;\n    char *text = (char *)malloc(len + 1);\n\n    int got = 0;\n    while (got < len) {\n        ssize_t n = read(fd_in, text + got, len - got);\n        if (n <= 0) break;\n        got += n;\n    }\n    text[got] = '\\0';\n    close(fd_in);\n\n    int pos = 0;\n    int n = (int)next_ll(text, &pos, got);\n    int W = (int)next_ll(text, &pos, got);\n\n    for (int i = 0; i < n; i++) {\n        int w = (int)next_ll(text, &pos, got);\n        long long v = next_ll(text, &pos, got);\n        for (int j = W; j >= w; j--) {\n            if (dp[j - w] + v > dp[j]) dp[j] = dp[j - w] + v;\n        }\n    }\n\n    long long ans = dp[W];\n    char out_buf[64];\n    int out_len = snprintf(out_buf, sizeof(out_buf), \"%lld\\n\", ans);\n\n    int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\n    if (fd_out >= 0) {\n        int off = 0;\n        while (off < out_len) {\n            ssize_t w = write(fd_out, out_buf + off, out_len - off);\n            if (w <= 0) break;\n            off += w;\n        }\n        close(fd_out);\n    }\n\n    printf(\"%lld\\n\", ans);\n    free(text);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Hàm slurp_file() + next_ll() đọc và bóc tách số nguyên hoàn toàn bằng open/read/close mà không đụng tới bất kỳ hàm đọc tệp stdio nào.",
      "Ghi chính xác chuỗi \"<ans>\\n\" ra dst_path bằng write() với quyền 0644 rồi in đồng thời ra stdout."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "fcntl.h",
        "unistd.h"
      ],
      "requiredApis": [
        "open",
        "read",
        "write",
        "close",
        "O_CREAT",
        "O_TRUNC"
      ],
      "forbiddenApis": [
        "fopen",
        "fscanf",
        "fprintf",
        "fread",
        "fwrite",
        "fgets"
      ],
      "qualityRules": [
        {
          "desc": "Mở tệp đích với quyền 0644 và ghi kèm ký tự xuống dòng \\n",
          "regex": "0644",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 (Vào/ra tệp toàn bộ bằng System Call: open, fstat, read, write, close — Mục 2.5) + Chương 7 (Quy hoạch động Balo 0/1 tối ưu không gian 1 chiều — Mục 7.11). Bài toán rèn kỹ năng tự phân tích số nguyên khi bị cấm hoàn toàn thư viện đệm stdio (fopen/fscanf/fprintf).",
      "idea": {
        "summary": "Đề bài cấm dùng fopen, fscanf, fprintf cho tệp nên ta xây dựng đường ống 3 chặng khép kín hoàn toàn bằng System Call POSIX: (1) Dùng open() + fstat() + vòng lặp read() nạp trọn vẹn nội dung tệp nguồn src_path vào một chuỗi RAM text rồi đóng tệp; (2) Dùng hàm tự viết next_ll() tách lần lượt n, W và n cặp (w_i, v_i) để giải bài toán Balo 0/1 bằng mảng Quy hoạch động 1 chiều dp[0..W] duyệt ngược từ W về w_i; (3) Dùng snprintf() định dạng kết quả thành chuỗi \"<ans>\\n\", mở tệp đích dst_path với cờ tạo mới/ghi đè quyền 0644, ghi trọn vẹn bằng vòng lặp write() và đồng thời in ans ra stdout.",
        "steps": [
          "Bước 1 — Mở tệp nguồn & kiểm tra lỗi: Đọc src, dst từ stdin. Gọi open(src, O_RDONLY); nếu < 0 thì in -1 ra stdout và kết thúc ngay (không tạo tệp đích).",
          "Bước 2 — Nạp toàn bộ tệp nguồn vào RAM bằng fstat() + read(): Gọi fstat(fd_in, &st) lấy chính xác kích thước tệp len, cấp phát char *text = malloc(len + 1), dùng vòng while đọc đủ byte chống short read, thêm '\\0' cuối chuỗi và gọi close(fd_in).",
          "Bước 3 — Tách số thủ công bằng next_ll(): Lần lượt trích xuất n, W và từng cặp (w, v) từ bộ đệm text bằng con trỏ vị trí pos mà không cần dùng fscanf().",
          "Bước 4 — Quy hoạch động Balo 0/1 tối ưu 1 chiều: Với mỗi đồ vật (w, v), duyệt trọng lượng NGƯỢC từ j = W xuống w và cập nhật dp[j] = max(dp[j], dp[j - w] + v) để đảm bảo mỗi đồ vật chỉ được chọn tối đa 1 lần.",
          "Bước 5 — Ghi kết quả ra tệp đích & stdout: Định dạng ans = dp[W] vào out_buf bằng snprintf(\"%lld\\n\", ans), mở dst bằng open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644), ghi đủ byte bằng vòng while(write(...)), đóng fd_out, in ans ra stdout và giải phóng free(text)."
        ],
        "whyThisWay": "Hệ thống chấm tĩnh kiểm tra chặt việc cấm fopen/fscanf/fprintf/fread/fwrite; do đó dùng open + fstat + read nạp trọn tệp nhỏ (n ≤ 200) vào RAM rồi tách bằng hàm next_ll() 12 dòng là cách vừa sạch, vừa nhanh, vừa ít lỗi nhất trong phòng thi. Dùng vòng while cho cả read() lẫn write() xử lý an toàn trường hợp short read / short write của nhân Linux. Trong DP Balo 0/1, duyệt ngược j từ W về w giúp giảm bộ nhớ từ O(n·W) xuống chỉ còn 1 mảng O(W) mà không dùng lại đồ vật vừa chọn.",
        "complexity": "Thời gian: O(n · W + S) (với S là kích thước tệp nguồn) · Bộ nhớ: O(W + S) (mảng dp[10005] + chuỗi text) · Tài nguyên OS: 2 File Descriptor tuần tự (fd_in, fd_out)"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–7",
          "title": "Khai báo thư viện hệ thống & mảng Quy hoạch động 1 chiều dp[]",
          "code": "#include <stdlib.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\nlong long dp[10005];",
          "explain": "Nạp <stdlib.h> cho malloc/free, <fcntl.h> cho open và các cờ O_*, <unistd.h> cho read/write/close, <sys/stat.h> cho struct stat và fstat(). Mảng toàn cục long long dp[10005] tự động được khởi tạo bằng 0 toàn bộ — khớp đúng trạng thái ban đầu (chưa chọn vật nào, tổng giá trị = 0). Kiểu long long chống tràn khi cộng tới 200 vật × 10^6 = 2 × 10^8 (và an toàn với mọi giới hạn lớn hơn)."
        },
        {
          "lines": "Dòng 9–21",
          "title": "Hàm tự tách số nguyên next_ll() thay thế fscanf()",
          "code": "long long next_ll(const char *s, int *pos, int len) {\n    while (*pos < len && (s[*pos] == ' ' || s[*pos] == '\\n' || s[*pos] == '\\r' || s[*pos] == '\\t')) (*pos)++;\n    int neg = 0;\n    if (*pos < len && s[*pos] == '-') { neg = 1; (*pos)++; }\n    long long val = 0;\n    while (*pos < len && s[*pos] >= '0' && s[*pos] <= '9') { val = val * 10 + (s[*pos] - '0'); (*pos)++; }\n    return neg ? -val : val;\n}",
          "explain": "Hàm đọc số nguyên tiếp theo trong chuỗi bộ nhớ s (độ dài len), tự động cập nhật con trỏ vị trí *pos sau mỗi lần gọi. Đầu tiên bỏ qua mọi ký tự trắng (' ', '\\n', '\\r' kiểu Windows CRLF, '\\t'); kiểm tra dấu âm '-' nếu có; sau đó ghép từng chữ số '0'..'9' bằng công thức val = val * 10 + (s[*pos] - '0'). Đây là công cụ 'vạn năng' thay thế hoàn toàn fscanf() cho mọi bài File System Call."
        },
        {
          "lines": "Dòng 23–31",
          "title": "Đọc tên tệp từ stdin & mở tệp nguồn src",
          "code": "char src[256], dst[256];\nscanf(\"%s %s\", src, dst);\nint fd_in = open(src, O_RDONLY);\nif (fd_in < 0) { printf(\"-1\\n\"); return 0; }",
          "explain": "Đọc hai đường dẫn src và dst từ stdin (scanf trên stdin được phép; chỉ cấm dùng fopen/fscanf cho tệp). Gọi open(src, O_RDONLY) để mở tệp nguồn ở chế độ chỉ đọc. Nếu fd_in < 0 (tệp không tồn tại hoặc không có quyền đọc), lập tức in -1 và return 0 — đúng yêu cầu đề bài và tuyệt đối không tạo tệp đích rác."
        },
        {
          "lines": "Dòng 33–45",
          "title": "Lấy kích thước bằng fstat(), cấp phát RAM & đọc trọn tệp bằng read()",
          "code": "struct stat st;\nfstat(fd_in, &st);\nint len = (int)st.st_size;\nchar *text = (char *)malloc(len + 1);\nint got = 0;\nwhile (got < len) {\n    ssize_t n = read(fd_in, text + got, len - got);\n    if (n <= 0) break;\n    got += n;\n}\ntext[got] = '\\0';\nclose(fd_in);",
          "explain": "Dùng fstat(fd_in, &st) lấy kích thước tệp trực tiếp từ FD đang mở (nhanh và an toàn hơn stat theo đường dẫn). Cấp phát len + 1 byte để chừa chỗ cho ký tự kết thúc chuỗi '\\0'. Vòng lặp while (got < len) gọi read(fd_in, text + got, len - got) bảo đảm đọc đủ toàn bộ tệp ngay cả khi một lời gọi read() chỉ trả về một phần (short read). Sau cùng gán text[got] = '\\0' và đóng ngay fd_in bằng close()."
        },
        {
          "lines": "Dòng 47–57",
          "title": "Phân tích dữ liệu & giải Quy hoạch động Balo 0/1 duyệt ngược",
          "code": "int n = (int)next_ll(text, &pos, got);\nint W = (int)next_ll(text, &pos, got);\nfor (int i = 0; i < n; i++) {\n    int w = (int)next_ll(text, &pos, got);\n    long long v = next_ll(text, &pos, got);\n    for (int j = W; j >= w; j--) {\n        if (dp[j - w] + v > dp[j]) dp[j] = dp[j - w] + v;\n    }\n}",
          "explain": "Gọi next_ll() lấy n và sức chứa W, rồi lặp n lần đọc cặp trọng lượng w và giá trị v của từng đồ vật. Ở vòng trong, PHẢI duyệt ngược j từ W giảm dần về w: vì khi tính dp[j] ta tra cứu dp[j - w] (nằm bên trái j), duyệt ngược bảo đảm dp[j - w] vẫn mang giá trị của tầng i - 1 (chưa chọn vật i). Nếu viết nhầm vòng xuôi j = w..W, một đồ vật sẽ bị chọn lặp lại nhiều lần (biến thành bài Unbounded Knapsack — sai bản chất 0/1!)."
        },
        {
          "lines": "Dòng 59–72",
          "title": "Định dạng chuỗi kết quả & ghi ra tệp đích bằng open/write/close",
          "code": "int out_len = snprintf(out_buf, sizeof(out_buf), \"%lld\\n\", ans);\nint fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\nif (fd_out >= 0) {\n    int off = 0;\n    while (off < out_len) {\n        ssize_t w = write(fd_out, out_buf + off, out_len - off);\n        if (w <= 0) break;\n        off += w;\n    }\n    close(fd_out);\n}",
          "explain": "System call write() chỉ ghi mảng byte thô chứ không định dạng số như fprintf, nên ta dùng snprintf() chuyển ans thành chuỗi \"<ans>\\n\" trong RAM và lấy đúng độ dài out_len. Mở tệp đích với 3 cờ chuẩn: O_WRONLY (chỉ ghi), O_CREAT (tạo mới nếu chưa có), O_TRUNC (xóa sạch nội dung cũ nếu tệp đã tồn tại), kèm tham số thứ 3 là quyền 0644 (chủ sở hữu đọc/ghi, nhóm & người khác chỉ đọc — BẮT BUỘC có khi dùng O_CREAT). Vòng while(off < out_len) đảm bảo ghi trọn vẹn toàn bộ out_len byte rồi đóng close(fd_out)."
        },
        {
          "lines": "Dòng 74–77",
          "title": "In kết quả ra stdout & giải phóng bộ nhớ động",
          "code": "printf(\"%lld\\n\", ans);\nfree(text);\nreturn 0;",
          "explain": "In chính xác đáp án ans ra stdout theo đúng định dạng đề bài yêu cầu, gọi free(text) trả lại vùng nhớ heap đã cấp phát bằng malloc() để không rò rỉ bộ nhớ, rồi trả về mã thành công 0."
        }
      ],
      "testCases": [
        {
          "name": "Bộ dữ liệu Balo 0/1 chuẩn",
          "caseDesc": "src chứa n = 4, W = 7; các vật (1,1), (3,4), (4,5), (5,7).",
          "howHandled": "Chọn tổ hợp (3,4) + (4,5) tổng trọng lượng 7, giá trị 9 → ghi chính xác \"9\\n\" vào dst và in \"9\" ra stdout."
        },
        {
          "name": "Sức chứa W = 0 hoặc mọi vật đều nặng hơn W",
          "caseDesc": "W = 0 hoặc w_i > W với mọi i.",
          "howHandled": "Vòng lặp for (int j = W; j >= w; j--) không chạy lần nào, dp[W] giữ nguyên giá trị 0 → ghi \"0\\n\" vào dst và in 0."
        },
        {
          "name": "Tệp nguồn có định dạng Windows (\\r\\n) hoặc nhiều khoảng trắng",
          "caseDesc": "Tệp nguồn chứa dấu cách dư, tab và xuống dòng CRLF (\\r\\n).",
          "howHandled": "Hàm next_ll() bỏ qua đầy đủ ' ', '\\n', '\\r', '\\t' nên phân tích số liệu chính xác không bị lệch."
        },
        {
          "name": "Tệp nguồn không tồn tại",
          "caseDesc": "src = missing.txt.",
          "howHandled": "open(src, O_RDONLY) trả về -1 → in \"-1\" ngay và return 0, không tạo tệp đích dst."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp <stdio.h>, <stdlib.h>, <fcntl.h>, <unistd.h>, <sys/stat.h>; khai báo mảng toàn cục long long dp[10005].",
        "Bước 2: Viết hàm 12 dòng next_ll(s, &pos, len) bỏ khoảng trắng/\\r/\\n/\\t và ghép từng chữ số.",
        "Bước 3: Mở src bằng open(src, O_RDONLY) — nếu < 0 in -1 và return 0; dùng fstat() + malloc(len + 1) + vòng while(read) nạp trọn tệp rồi close(fd_in).",
        "Bước 4: Đọc n, W và n cặp (w, v) bằng next_ll(), chạy DP Balo 0/1 vòng ngược j = W giảm về w.",
        "Bước 5: Dùng snprintf(out_buf, sizeof(out_buf), \"%lld\\n\", dp[W]), mở dst bằng open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644), vòng while(write), close(fd_out), printf ra stdout và free(text)."
      ]
    }
  },
  {
    "num": 45,
    "id": "CR-45",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (Process + Pipe + Song song)",
    "difficulty": "Khó",
    "title": "Tìm đồng thời Min và Max của mảng bằng k tiến trình con qua pipe()",
    "staticSummary": "Kiểm tra tĩnh fork, pipe, waitpid",
    "prompt": "Cho mảng gồm n số nguyên và số tiến trình con k. Tiến trình cha tạo một mảng ống pipe() riêng biệt cho tối đa c = min(n, k) tiến trình con sinh bởi fork(). Mỗi tiến trình con xử lý phần mảng được phân hoạch tĩnh, tìm đồng thời giá trị nhỏ nhất mn và lớn nhất mx trên đoạn của nó, đóng gói vào struct { long long mn; long long mx; } và gửi trọn vẹn qua ống riêng về cha rồi _exit(0). Cha đọc tất cả các cặp (mn, mx), gọi waitpid() cho mọi tiến trình con và in ra <global_min> <global_max>.",
    "requirements": [
      "Sử dụng <unistd.h> và <sys/wait.h>.",
      "Bắt buộc dùng fork(), pipe(), waitpid(); dùng ống riêng cho từng con để truyền cấu trúc (mn, mx) an toàn.",
      "Đóng các đầu ống không sử dụng ở cả cha và con; xử lý chính xác trường hợp k > n."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n k. Dòng 2: n số nguyên a_0, ..., a_{n-1}.",
    "outputSpec": "Hai số nguyên (long long) trên 1 dòng: global_min global_max.",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= k <= 8",
      "-10^9 <= a_i <= 10^9"
    ],
    "example": {
      "note": "Ba tiến trình con tìm cặp (min, max) cục bộ và gửi struct 16 byte qua pipe riêng về cha.",
      "input": "7 3\n15 -42 8 99 0 -3 74",
      "output": "-42 99"
    },
    "relatedTopics": [
      {
        "id": "3-8",
        "label": "3.8 Truyền cấu trúc nhị phân (struct) qua pipe()"
      },
      {
        "id": "5-4",
        "label": "5.4 Phân hoạch dữ liệu đa tiến trình"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Truyền trực tiếp một struct { long long mn; long long mx; } (16 byte) qua pipe giữa cha và con trên cùng máy rất gọn và chuẩn xác khi dùng cặp read_exact / write_all và đóng sạch các đầu ống thừa.",
    "relatedQuestions": [
      "CR-11",
      "CR-15",
      "CR-19"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\ntypedef struct {\n    long long mn;\n    long long mx;\n} MinMax;\n\nint main() {\n    int n, k;\n    scanf(\"%d %d\", &n, &k);\n\n    long long *a = (long long *)malloc(n * sizeof(long long));\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n\n    int c = (k < n) ? k : n;\n    int pipes[8][2];\n    pid_t pids[8];\n\n    int base = n / c, rem = n % c;\n    for (int i = 0; i < c; i++) {\n        pipe(pipes[i]);\n        int L = i * base + (i < rem ? i : rem);\n        int R = L + base + (i < rem ? 1 : 0);\n\n        pid_t pid = fork();\n        if (pid == 0) {\n            close(pipes[i][0]);\n            for (int j = 0; j < i; j++) close(pipes[j][0]);\n\n            MinMax mm;\n            mm.mn = a[L];\n            mm.mx = a[L];\n            for (int idx = L + 1; idx < R; idx++) {\n                if (a[idx] < mm.mn) mm.mn = a[idx];\n                if (a[idx] > mm.mx) mm.mx = a[idx];\n            }\n\n            write(pipes[i][1], &mm, sizeof(mm));\n            close(pipes[i][1]);\n            free(a);\n            _exit(0);\n        } else {\n            pids[i] = pid;\n            close(pipes[i][1]);\n        }\n    }\n\n    MinMax ans;\n    for (int i = 0; i < c; i++) {\n        MinMax cur;\n        read(pipes[i][0], &cur, sizeof(cur));\n        close(pipes[i][0]);\n        if (i == 0) {\n            ans = cur;\n        } else {\n            if (cur.mn < ans.mn) ans.mn = cur.mn;\n            if (cur.mx > ans.mx) ans.mx = cur.mx;\n        }\n    }\n\n    for (int i = 0; i < c; i++) waitpid(pids[i], NULL, 0);\n\n    printf(\"%lld %lld\\n\", ans.mn, ans.mx);\n    free(a);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Giới hạn c = min(n, k) đảm bảo mọi tiến trình con đều có đoạn [L, R) khác rỗng nên khởi tạo res = { arr[L], arr[L] } hoàn toàn an toàn.",
      "Đóng toàn bộ các FD thừa của những ống khác trong tiến trình con trước khi tính toán và thoát bằng _exit(0)."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "fork",
        "pipe",
        "waitpid",
        "struct"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Xử lý giới hạn c = min(n, k) và thoát con bằng _exit()",
          "regex": "\\b_?exit\\s*\\(",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 (Tạo nhiều tiến trình con với fork(), mảng ống pipe() và waitpid() — Mục 3.8) + Chương 5 (Phân hoạch tĩnh song song & Thu gọn kết quả Reduction — Mục 5.4). Bài toán mẫu mực về truyền struct qua IPC mà không bị trộn lẫn byte giữa nhiều tiến trình con.",
      "idea": {
        "summary": "Để tìm đồng thời giá trị nhỏ nhất (Min) và lớn nhất (Max) của mảng n phần tử bằng tối đa k tiến trình con, tiến trình cha trước hết tính số tiến trình thực tế c = min(k, n) để tránh sinh tiến trình rỗng khi k > n. Cha cấp phát mảng c đường ống riêng biệt pipes[c][2], phân hoạch mảng thành c đoạn liên tiếp [L, R) rồi gọi fork(). Mỗi tiến trình con tự quét đoạn của mình, đóng gói cặp (mn, mx) vào một struct MinMax (16 byte) và gửi nguyên khối về cha qua ống riêng rồi _exit(0); cha nhận đủ c cấu trúc, hợp nhất thành Min/Max toàn cục và thu dọn toàn bộ con bằng waitpid().",
        "steps": [
          "Bước 1 — Đọc mảng & chuẩn hóa số tiến trình con: Đọc n, k và mảng động a[0..n-1]. Tính c = min(k, n) để bảo đảm mỗi tiến trình con luôn có ít nhất 1 phần tử (R > L), giúp khởi tạo mn = mx = a[L] luôn hợp lệ.",
          "Bước 2 — Tạo mảng pipe riêng & phân hoạch tĩnh [L, R): Lặp i = 0..c-1, tạo ống riêng pipe(pipes[i]), tính đoạn [L, R) chia đều số dư rem = n % c rồi gọi fork().",
          "Bước 3 — Đóng toàn bộ FD thừa trong tiến trình con: Khi fork() ở vòng thứ i, con thừa hưởng cả đầu đọc pipes[0..i-1][0] đang mở của cha! Con phải đóng pipes[i][0] VÀ đóng vòng lặp j = 0..i-1 cho pipes[j][0] để không giữ rò rỉ đầu ống của các con trước.",
          "Bước 4 — Tính cục bộ & gửi struct MinMax: Con gán mn = mx = a[L], duyệt L + 1 .. R - 1 tìm min/max cục bộ, gọi write(pipes[i][1], &mm, sizeof(mm)), đóng pipes[i][1], free(a) và thoát bằng _exit(0).",
          "Bước 5 — Cha thu kết quả, hợp nhất & thu gom Zombie: Cha đóng pipes[i][1] ngay trong vòng fork; sau khi tạo đủ c con, cha lần lượt đọc c struct từ pipes[i][0], gộp thành ans.mn/ans.mx, gọi waitpid() cho toàn bộ pids[0..c-1] rồi in đáp án."
        ],
        "whyThisWay": "Dùng mảng c ống riêng biệt pipes[8][2] thay vì dùng chung 1 ống duy nhất loại bỏ hoàn toàn rủi ro trộn lẫn dữ liệu giữa các con và giúp việc truyền struct 16 byte đơn giản, rõ ràng. Việc tách riêng vòng tạo c con với vòng đọc kết quả cho phép cả c tiến trình con chạy SONG SONG thực sự trên nhiều nhân CPU (nếu đọc hoặc waitpid ngay bên trong vòng fork, các con sẽ phải chạy tuần tự từng đứa một — mất hoàn toàn tính song song!).",
        "complexity": "Thời gian: O(n / c + c) (song song trên c tiến trình con) · Bộ nhớ: O(n) (mảng a[] dùng cơ chế Copy-on-Write của fork, không nhân bản trang nhớ vì con chỉ đọc) · Tài nguyên OS: c tiến trình con + c pipe"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–9",
          "title": "Khai báo thư viện & định nghĩa cấu trúc gói tin MinMax",
          "code": "#include <unistd.h>\n#include <sys/wait.h>\ntypedef struct {\n    long long mn;\n    long long mx;\n} MinMax;",
          "explain": "Nạp <stdio.h>, <stdlib.h> (malloc/free), <unistd.h> (pipe/fork/read/write/close/_exit) và <sys/wait.h> (waitpid). Đóng gói cả mn và mx vào struct MinMax (hai trường long long, tổng 16 byte) để tiến trình con gửi trọn cặp kết quả chỉ trong đúng một lời gọi write() và cha đọc về bằng một lời gọi read()."
        },
        {
          "lines": "Dòng 11–20",
          "title": "Đọc mảng đầu vào & tính số tiến trình thực tế c = min(k, n)",
          "code": "long long *a = (long long *)malloc(n * sizeof(long long));\nfor (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\nint c = (k < n) ? k : n;\nint pipes[8][2];\npid_t pids[8];",
          "explain": "Cấp phát động mảng a chứa tối đa 10^5 phần tử long long trên heap (tránh tràn stack nếu mảng lớn). Dòng 18 đặt c = min(k, n): giả sử n = 2 mà k = 8, ta chỉ cần tạo 2 tiến trình con để mỗi con chắc chắn có ≥ 1 phần tử; nếu tạo con thứ 3 với đoạn rỗng [L, R) thì truy cập a[L] sẽ đọc sai hoặc vượt biên! Khai báo mảng pipes[8][2] và pids[8] (dư sức cho k ≤ 8)."
        },
        {
          "lines": "Dòng 22–31",
          "title": "Tạo pipe riêng, phân hoạch [L, R), fork() & dọn FD thừa ở con",
          "code": "pipe(pipes[i]);\nint L = i * base + (i < rem ? i : rem);\nint R = L + base + (i < rem ? 1 : 0);\npid_t pid = fork();\nif (pid == 0) {\n    close(pipes[i][0]);\n    for (int j = 0; j < i; j++) close(pipes[j][0]);",
          "explain": "Với mỗi con i, tạo trước đường ống pipes[i] và tính chính xác đoạn chỉ số [L, R) phân bổ đều phần dư rem = n % c. Ngay khi vào nhánh con (pid == 0), con đóng đầu đọc pipes[i][0] của chính mình VÀ chạy vòng lặp đóng toàn bộ đầu đọc pipes[0..i-1][0] mà cha đang giữ mở từ các vòng lặp trước (tránh rò rỉ File Descriptor — một chi tiết rất chuẩn mực trong lập trình hệ thống Linux)."
        },
        {
          "lines": "Dòng 33–44",
          "title": "Con tìm đồng thời mn/mx, gửi struct MinMax & kết thúc bằng _exit(0)",
          "code": "MinMax mm; mm.mn = a[L]; mm.mx = a[L];\nfor (int idx = L + 1; idx < R; idx++) {\n    if (a[idx] < mm.mn) mm.mn = a[idx];\n    if (a[idx] > mm.mx) mm.mx = a[idx];\n}\nwrite(pipes[i][1], &mm, sizeof(mm));\nclose(pipes[i][1]);\nfree(a); _exit(0);",
          "explain": "Khởi tạo mm.mn = mm.mx = a[L] thay vì dùng 0 hay hằng số ước chừng — đảm bảo đúng tuyệt đối kể cả khi mọi số trong mảng đều âm (ví dụ toàn -10^9) hoặc toàn dương lớn. Sau khi duyệt xong đoạn [L, R), ghi trọn 16 byte của mm vào pipes[i][1], đóng ống, giải phóng mảng a và gọi _exit(0) để thoát tiến trình con sạch sẽ (không chạy tiếp vòng for sinh thêm con cháu ngoài ý muốn — tránh Fork Bomb!)."
        },
        {
          "lines": "Dòng 45–49",
          "title": "Nhánh tiến trình cha lưu PID & đóng đầu ghi không dùng",
          "code": "} else {\n    pids[i] = pid;\n    close(pipes[i][1]);\n}",
          "explain": "Tiến trình cha lưu PID của con thứ i vào pids[i] để thu gom sau, đồng thời đóng ngay đầu ghi pipes[i][1] của ống đó. Lưu ý cha KHÔNG gọi read() hay waitpid() ở đây để vòng for chạy vèo một mạch tạo cả c tiến trình con chạy song song thực sự."
        },
        {
          "lines": "Dòng 51–62",
          "title": "Cha đọc c gói MinMax từ các ống riêng & hợp nhất toàn cục",
          "code": "for (int i = 0; i < c; i++) {\n    MinMax cur;\n    read(pipes[i][0], &cur, sizeof(cur));\n    close(pipes[i][0]);\n    if (i == 0) ans = cur;\n    else {\n        if (cur.mn < ans.mn) ans.mn = cur.mn;\n        if (cur.mx > ans.mx) ans.mx = cur.mx;\n    }\n}",
          "explain": "Sau khi tất cả c tiến trình con đã khởi chạy song song, cha lần lượt đọc từng struct MinMax từ pipes[i][0] (hàm read() tự động chờ nếu con thứ i chưa tính xong) và đóng pipes[i][0] ngay sau khi đọc. Với kết quả đầu tiên (i == 0) gán trực tiếp ans = cur; từ i ≥ 1 so sánh cập nhật ans.mn nhỏ hơn và ans.mx lớn hơn."
        },
        {
          "lines": "Dòng 64–69",
          "title": "Thu dọn toàn bộ tiến trình con bằng waitpid(), in kết quả & free()",
          "code": "for (int i = 0; i < c; i++) waitpid(pids[i], NULL, 0);\nprintf(\"%lld %lld\\n\", ans.mn, ans.mx);\nfree(a);\nreturn 0;",
          "explain": "Gọi waitpid(pids[i], NULL, 0) cho từng PID đã lưu để thu hồi hoàn toàn trạng thái thoát của cả c tiến trình con, không để sót bất kỳ tiến trình Zombie nào trong bảng tiến trình của hệ điều hành. In \"<global_min> <global_max>\" trên 1 dòng rồi giải phóng bộ nhớ động free(a)."
        }
      ],
      "testCases": [
        {
          "name": "Mảng chuẩn có cả số âm, số 0 và số dương",
          "caseDesc": "n = 7, k = 3; mảng: 15 -42 8 99 0 -3 74.",
          "howHandled": "Chia thành 3 đoạn (3, 2, 2 phần tử), 3 con gửi (-42, 15), (0, 99), (-3, 74) → cha hợp nhất in \"-42 99\"."
        },
        {
          "name": "Trường hợp k > n (ít phần tử hơn số tiến trình yêu cầu)",
          "caseDesc": "n = 1, k = 8; mảng: [-500].",
          "howHandled": "c = min(8, 1) = 1 → chỉ sinh đúng 1 con xử lý [0, 1), tránh đọc vượt biên a[L], in \"-500 -500\"."
        },
        {
          "name": "Tất cả phần tử đều âm lớn",
          "caseDesc": "n = 4, k = 2; mảng: -1000000000 -500000000 -999999999 -10.",
          "howHandled": "Vì khởi tạo mm.mn = mm.mx = a[L] thay vì 0, giá trị lớn nhất tìm được là -10 (không bị sai thành 0), in \"-1000000000 -10\"."
        },
        {
          "name": "Mảng lớn tối đa (n = 10^5, k = 8)",
          "caseDesc": "100.000 phần tử chia cho 8 tiến trình con.",
          "howHandled": "8 con chạy song song trên 8 đoạn độc lập, truyền mỗi con đúng 16 byte qua pipe riêng và cha thu gom sạch bằng 8 lần waitpid()."
        }
      ],
      "examRecipe": [
        "Bước 1: Định nghĩa struct MinMax { long long mn; long long mx; }; và đọc n, k, cấp phát malloc mảng a[n].",
        "Bước 2: Đặt c = (k < n) ? k : n; khai báo pipes[8][2] và pids[8]; tính base = n / c, rem = n % c.",
        "Bước 3: Vòng for i = 0..c-1: gọi pipe(pipes[i]), tính [L, R), gọi fork(). Trong con: đóng pipes[0..i][0], quét [L, R) khởi tạo từ a[L], write(&mm, sizeof(mm)) vào pipes[i][1], đóng ống, free(a), _exit(0). Trong cha: lưu pids[i], đóng pipes[i][1].",
        "Bước 4: Sau vòng fork, viết vòng for i = 0..c-1 đọc cur từ pipes[i][0], đóng ống và gộp ans.mn / ans.mx.",
        "Bước 5: Gọi vòng waitpid(pids[i], NULL, 0) cho đủ c con, in \"%lld %lld\\n\" rồi free(a)."
      ]
    }
  },
  {
    "num": 46,
    "id": "CR-46",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (DP + Thread)",
    "difficulty": "Khó",
    "title": "Song song hóa Quy hoạch động Balo 0/1 theo tầng trọng lượng với T luồng",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join",
    "prompt": "Trong bảng Quy hoạch động 0/1 Knapsack, mỗi phần tử ở hàng i (dp_cur[w], w = 0..W) chỉ phụ thuộc vào hàng i - 1 (dp_prev[w] và dp_prev[w - w_i]) nên toàn bộ W + 1 trạng thái trong cùng một hàng hoàn toàn độc lập với nhau. Hãy cài đặt thuật toán DP song song hóa theo từng hàng sử dụng T luồng pthread: ứng với mỗi vật i = 1..n, chia dải trọng lượng [0..W] thành T đoạn để các luồng tính song song mảng dp_cur[], đồng bộ hoàn tất hàng i (bằng Barrier tự cài đặt với T luồng cố định hoặc pthread_join theo từng hàng) trước khi hoán đổi dp_prev và dp_cur sang vật tiếp theo. In dp_prev[W].",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng pthread_create(), pthread_join(); đảm bảo đồng bộ chặt chẽ giữa hai hàng liên tiếp (không race trên dp_prev/dp_cur).",
      "Sử dụng kiểu long long cho các giá trị DP."
    ],
    "inputSpec": "Dòng 1: ba số nguyên n W T. n dòng tiếp theo: mỗi dòng 2 số w_i v_i.",
    "outputSpec": "Một số nguyên (long long) là giá trị lớn nhất đạt được với sức chứa W.",
    "constraints": [
      "1 <= n <= 200",
      "1 <= W <= 10^4",
      "1 <= T <= 8",
      "1 <= w_i <= 10^4, 0 <= v_i <= 10^6"
    ],
    "example": {
      "note": "Chọn vật (6, 30) và (4, 16) cho tổng trọng lượng 10 và giá trị tối đa 46.",
      "input": "4 10 4\n6 30\n3 14\n4 16\n2 9",
      "output": "46"
    },
    "relatedTopics": [
      {
        "id": "4-10",
        "label": "4.10 Barrier tái sử dụng nhiều vòng với biến thế hệ (Generation Counter)"
      },
      {
        "id": "5-6",
        "label": "5.6 Phụ thuộc dữ liệu giữa các hàng vs Độc lập trong cùng một hàng"
      },
      {
        "id": "7-11",
        "label": "7.11 Bảng trạng thái 2 hàng dp_prev / dp_cur của 0/1 Knapsack"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Thay vì tạo mới rồi hủy T luồng lặp đi lặp lại n = 200 lần (tốn tới 1600 lần gọi hệ thống clone), ta chỉ tạo T luồng ĐÚNG 1 LẦN và dùng Barrier tái sử dụng để đồng bộ giữa các hàng rồi tráo con trỏ dp_prev <-> dp_cur!",
    "relatedQuestions": [
      "CR-21",
      "CR-37",
      "CR-41"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <pthread.h>\n\nint n, W, T;\nint wt[205];\nlong long val[205];\nlong long buf1[10005], buf2[10005];\nlong long *dp_prev = buf1;\nlong long *dp_cur = buf2;\nint cur_w;\nlong long cur_v;\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int total = W + 1;\n    int base = total / T, rem = total % T;\n    int L = tid * base + (tid < rem ? tid : rem);\n    int R = L + base + (tid < rem ? 1 : 0);\n\n    for (int w = L; w < R; w++) {\n        long long best = dp_prev[w];\n        if (w >= cur_w && dp_prev[w - cur_w] + cur_v > best) {\n            best = dp_prev[w - cur_w] + cur_v;\n        }\n        dp_cur[w] = best;\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d %d\", &n, &W, &T);\n    for (int i = 0; i < n; i++) scanf(\"%d %lld\", &wt[i], &val[i]);\n\n    pthread_t th[16];\n    int ids[16];\n\n    for (int i = 0; i < n; i++) {\n        cur_w = wt[i];\n        cur_v = val[i];\n\n        for (int t = 0; t < T; t++) {\n            ids[t] = t;\n            pthread_create(&th[t], NULL, worker, &ids[t]);\n        }\n        for (int t = 0; t < T; t++) {\n            pthread_join(th[t], NULL);\n        }\n\n        long long *tmp = dp_prev;\n        dp_prev = dp_cur;\n        dp_cur = tmp;\n    }\n\n    printf(\"%lld\\n\", dp_prev[W]);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Hai điểm chắn barrier_wait() quanh lệnh hoán đổi con trỏ dp_prev <-> dp_cur đảm bảo: (1) mọi luồng đã tính xong hàng hiện tại trước khi tráo, và (2) luồng 0 đã tráo xong con trỏ trước khi bất kỳ luồng nào sang vật kế tiếp!"
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "long long"
      ],
      "forbiddenApis": [
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Tách biệt hai mảng trạng thái dp_prev và dp_cur tránh ghi đè cùng hàng",
          "regex": "dp_prev[\\s\\S]*dp_cur|prev[\\s\\S]*cur",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 4 (Đồng bộ rào chắn theo từng tầng công việc với pthread — Mục 4.7) + Chương 7 (Song song hóa Quy hoạch động Balo 0/1 theo tầng trọng lượng — Mục 7.11). Kỹ thuật Double Buffering (2 mảng luân phiên) loại bỏ hoàn toàn race condition mà không tốn chi phí khóa mutex.",
      "idea": {
        "summary": "Trong Quy hoạch động Balo 0/1, giá trị hàng hiện tại dp_cur[w] (với mọi trọng lượng w = 0..W) chỉ đọc dữ liệu từ hàng trước đó dp_prev[w] và dp_prev[w - w_i], hoàn toàn KHÔNG phụ thuộc vào các ô khác trong cùng hàng hiện tại. Tận dụng tính độc lập dữ liệu này, ta duy trì 2 mảng buf1, buf2 với 2 con trỏ dp_prev (chỉ đọc) và dp_cur (chỉ ghi). Ứng với từng đồ vật i = 0..n-1, ta chia W + 1 trọng lượng thành T đoạn rời nhau cho T luồng tính song song dp_cur[], dùng pthread_join() làm rào chắn hoàn tất tầng i, rồi hoán đổi con trỏ dp_prev ↔ dp_cur trong O(1) trước khi sang vật tiếp theo.",
        "steps": [
          "Bước 1 — Thiết lập Double Buffering (2 mảng luân phiên): Khai báo 2 mảng toàn cục buf1[10005], buf2[10005] (mặc định toàn 0) cùng 2 con trỏ dp_prev = buf1 và dp_cur = buf2.",
          "Bước 2 — Đọc dữ liệu bài toán: Đọc n, W, T và danh sách n đồ vật (wt[i], val[i]).",
          "Bước 3 — Vòng lặp tuần tự theo từng đồ vật i = 0..n-1: Cập nhật cur_w = wt[i], cur_v = val[i] trước khi tạo luồng để cả T luồng cùng thấy thông số của vật hiện tại.",
          "Bước 4 — Tính song song toàn bộ tầng [0..W] không cần mutex: Chia total = W + 1 ô thành T đoạn rời nhau [L, R). Mỗi luồng đọc hoàn toàn từ dp_prev[] và chỉ ghi vào đoạn dp_cur[L..R-1] riêng của mình.",
          "Bước 5 — Đồng bộ tầng & hoán đổi con trỏ O(1): Gọi pthread_join() chờ đủ T luồng hoàn tất hàng i, sau đó tráo hai con trỏ dp_prev ↔ dp_cur (không cần copy mảng!). Sau n tầng, đáp án cuối cùng nằm tại dp_prev[W]."
        ],
        "whyThisWay": "Nếu chỉ dùng 1 mảng dp[] duy nhất như cách tuần tự (CR-44) rồi cho nhiều luồng cùng cập nhật song song, luồng đọc dp[w - cur_w] có thể đọc nhầm giá trị MỚI mà luồng khác vừa ghi đè ở cùng tầng — gây Data Race sai kết quả! Tách riêng dp_prev (chỉ đọc) và dp_cur (ghi theo phân vùng rời nhau) đảm bảo 0% Data Race và 0 lần khóa mutex. Hơn nữa, hoán đổi con trỏ sau mỗi tầng chỉ mất 3 phép gán O(1) thay vì phải memcpy cả 10.005 phần tử.",
        "complexity": "Thời gian: O(n · W / T) (+ chi phí đồng bộ n lần tầng luồng) · Bộ nhớ: O(W) (2 mảng buf1, buf2 mỗi mảng ~80 KB) · Tài nguyên OS: T luồng POSIX mỗi tầng, 0 mutex"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–11",
          "title": "Khai báo thư viện & kỹ thuật Double Buffering (dp_prev, dp_cur)",
          "code": "long long buf1[10005], buf2[10005];\nlong long *dp_prev = buf1;\nlong long *dp_cur = buf2;\nint cur_w;\nlong long cur_v;",
          "explain": "Khai báo mảng dữ liệu đồ vật wt[205], val[205] và hai mảng DP toàn cục buf1, buf2 (tự động khởi tạo 0 — đúng với trường hợp 0 đồ vật). Hai con trỏ dp_prev và dp_cur cho phép ta đổi vai trò 'hàng cũ' và 'hàng mới' ngay lập tức sau mỗi tầng mà không tốn thời gian sao chép mảng. Biến cur_w, cur_v lưu thông số của đồ vật đang xét để T luồng chỉ đọc."
        },
        {
          "lines": "Dòng 13–18",
          "title": "Phân hoạch tĩnh W + 1 trọng lượng [0..W] cho luồng tid",
          "code": "int tid = *(int *)arg;\nint total = W + 1;\nint base = total / T, rem = total % T;\nint L = tid * base + (tid < rem ? tid : rem);\nint R = L + base + (tid < rem ? 1 : 0);",
          "explain": "Lưu ý chi tiết dễ nhầm: dải trọng lượng đi từ 0 đến W bao gồm đúng total = W + 1 phần tử (không phải W!). Chia đều W + 1 phần tử cho T luồng sao cho các đoạn [L, R) phủ kín [0, W + 1) và đôi một không giao nhau. Nhờ các đoạn [L, R) hoàn toàn tách biệt, không bao giờ có hai luồng cùng ghi vào một ô dp_cur[w]."
        },
        {
          "lines": "Dòng 20–28",
          "title": "Chuyển trạng thái Balo 0/1 song song từ dp_prev sang dp_cur",
          "code": "for (int w = L; w < R; w++) {\n    long long best = dp_prev[w];\n    if (w >= cur_w && dp_prev[w - cur_w] + cur_v > best) {\n        best = dp_prev[w - cur_w] + cur_v;\n    }\n    dp_cur[w] = best;\n}",
          "explain": "Với mỗi trọng lượng w thuộc đoạn [L, R): phương án mặc định (không chọn vật i) cho giá trị best = dp_prev[w]. Nếu sức chứa đủ lớn (w >= cur_w) và phương án chọn vật i (dp_prev[w - cur_w] + cur_v) lớn hơn best thì cập nhật best. Cuối cùng ghi dp_cur[w] = best. Do mọi phép đọc đều nhắm vào dp_prev (bất biến trong suốt tầng i) và phép ghi nhắm vào dp_cur[w] độc quyền của luồng, đoạn mã chạy song song hoàn toàn an toàn không cần khóa."
        },
        {
          "lines": "Dòng 30–35",
          "title": "Đọc đầu vào & chuẩn bị mảng quản lý T luồng",
          "code": "scanf(\"%d %d %d\", &n, &W, &T);\nfor (int i = 0; i < n; i++) scanf(\"%d %lld\", &wt[i], &val[i]);\npthread_t th[16];\nint ids[16];",
          "explain": "Đọc n, sức chứa W, số luồng T và n cặp (wt[i], val[i]) (chú ý %lld cho val[i] kiểu long long). Khai báo mảng th[16] lưu định danh luồng và mảng ids[16] lưu tham số tid riêng biệt cho từng luồng."
        },
        {
          "lines": "Dòng 37–47",
          "title": "Vòng lặp từng đồ vật: tạo & pthread_join() T luồng làm rào chắn tầng",
          "code": "for (int i = 0; i < n; i++) {\n    cur_w = wt[i]; cur_v = val[i];\n    for (int t = 0; t < T; t++) {\n        ids[t] = t;\n        pthread_create(&th[t], NULL, worker, &ids[t]);\n    }\n    for (int t = 0; t < T; t++) pthread_join(th[t], NULL);",
          "explain": "Các tầng đồ vật có sự phụ thuộc tuần tự (tầng i cần kết quả tầng i - 1) nên vòng ngoài duyệt từng đồ vật i = 0..n-1. Thiết lập cur_w, cur_v TRƯỚC khi gọi pthread_create() để bảo đảm đồng bộ bộ nhớ. Sau khi khởi chạy T luồng tính song song hàng i, vòng pthread_join() đóng vai trò rào chắn (barrier) chắc chắn 100% toàn bộ dp_cur[0..W] đã tính xong trước khi chuyển sang bước hoán đổi."
        },
        {
          "lines": "Dòng 49–56",
          "title": "Hoán đổi con trỏ O(1) sau mỗi tầng & in kết quả dp_prev[W]",
          "code": "    long long *tmp = dp_prev;\n    dp_prev = dp_cur;\n    dp_cur = tmp;\n}\nprintf(\"%lld\\n\", dp_prev[W]);\nreturn 0;",
          "explain": "Hoán đổi hai con trỏ dp_prev và dp_cur: hàng vừa tính xong (dp_cur) lập tức trở thành hàng tham chiếu (dp_prev) cho vật i + 1, còn vùng nhớ cũ được tái sử dụng để ghi đè tầng tiếp theo. Vì phép hoán đổi thực hiện ở cuối mỗi lượt lặp (kể cả lượt cuối i = n - 1), kết quả cuối cùng luôn nằm ở dp_prev[W] chứ không phải dp_cur[W]!"
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ Balo 0/1 chuẩn với 4 luồng",
          "caseDesc": "n = 4, W = 10, T = 4; các vật (6,30), (3,14), (4,16), (2,9).",
          "howHandled": "Sau 4 tầng đồng bộ song song, chọn (6,30) + (4,16) → dp_prev[10] = 46."
        },
        {
          "name": "Số luồng lớn hơn số trạng thái (T > W + 1)",
          "caseDesc": "W = 2, T = 8 → total = 3 trạng thái (w = 0, 1, 2).",
          "howHandled": "3 luồng đầu nhận lần lượt [0,1), [1,2), [2,3); 5 luồng còn lại có L == R (đoạn rỗng), vòng for không chạy và kết thúc an toàn không lỗi."
        },
        {
          "name": "Vật phẩm có giá trị 0 hoặc nặng hơn W",
          "caseDesc": "Một số vật có w_i > W hoặc v_i = 0.",
          "howHandled": "Điều kiện if (w >= cur_w && ...) tự động bỏ qua các vật quá nặng, giữ nguyên giá trị tối ưu từ dp_prev[w]."
        },
        {
          "name": "Stress test biên tối đa (n = 200, W = 10^4, T = 8)",
          "caseDesc": "200 tầng × 10.001 trạng thái, giá trị tới 10^6 mỗi vật.",
          "howHandled": "Không có race condition nhờ tách dp_prev/dp_cur, tổng giá trị tới 2 × 10^8 chứa gọn trong long long."
        }
      ],
      "examRecipe": [
        "Bước 1: Khai báo 2 mảng toàn cục long long buf1[10005], buf2[10005] và 2 con trỏ dp_prev = buf1, dp_cur = buf2 cùng cur_w, cur_v.",
        "Bước 2: Viết worker(): chia total = W + 1 (nhớ +1!) cho T luồng thành đoạn [L, R).",
        "Bước 3: Trong worker(): với mỗi w từ L đến R - 1, tính dp_cur[w] = max(dp_prev[w], w >= cur_w ? dp_prev[w - cur_w] + cur_v : 0).",
        "Bước 4: Trong main(): duyệt từng vật i = 0..n-1, cập nhật cur_w, cur_v, tạo T luồng, pthread_join() cả T luồng rồi hoán đổi con trỏ dp_prev ↔ dp_cur.",
        "Bước 5: Sau vòng for n vật, in dp_prev[W] (nhớ là dp_prev chứ không phải dp_cur!) bằng %lld."
      ]
    }
  },
  {
    "num": 47,
    "id": "CR-47",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (DP + Thread)",
    "difficulty": "Khó",
    "title": "Tính độ dài LCS bằng Memoization kết hợp pthread và Mutex",
    "staticSummary": "Biên dịch với -pthread; kiểm tra tĩnh pthread_create, pthread_join, pthread_mutex_t",
    "prompt": "Cho hai chuỗi X (độ dài m) và Y (độ dài n). Viết chương trình tính độ dài Chuỗi con chung dài nhất (LCS) bằng Quy hoạch động Top-Down (Memoization) sử dụng bảng nhớ chung memo[m+1][n+1] (khởi tạo -1) được bảo vệ bằng pthread_mutex_t. Khi cả hai chuỗi khác rỗng và X[m-1] != Y[n-1], tại lời gọi gốc hãy tạo 2 luồng con bằng pthread_create() để tính đồng thời LCS(m - 1, n) và LCS(m, n - 1), sau đó pthread_join() và lấy giá trị lớn hơn (hoặc giới hạn độ sâu tách luồng bằng 1..2 mức để không tạo quá nhiều luồng và không giữ lock khi chờ pthread_join).",
    "requirements": [
      "Sử dụng <pthread.h>.",
      "Bắt buộc dùng bảng memo[][] kết hợp pthread_create(), pthread_join() và pthread_mutex_t bảo vệ đọc/ghi memo[][].",
      "Không giữ khóa mutex trong lúc gọi đệ quy hoặc gọi pthread_join() (phòng tránh deadlock)."
    ],
    "inputSpec": "Dòng 1: chuỗi X. Dòng 2: chuỗi Y.",
    "outputSpec": "Một số nguyên duy nhất là độ dài LCS của X và Y.",
    "constraints": [
      "1 <= |X|, |Y| <= 500",
      "X, Y không chứa khoảng trắng"
    ],
    "example": {
      "note": "Chuỗi con chung dài nhất của AGGTAB và GXTXAYB là GTAB (độ dài 4).",
      "input": "AGGTAB\nGXTXAYB",
      "output": "4"
    },
    "relatedTopics": [
      {
        "id": "4-9",
        "label": "4.9 Nguyên tắc không giữ Mutex khi gọi đệ quy hay pthread_join()"
      },
      {
        "id": "7-6",
        "label": "7.6 Top-Down Memoization khởi tạo -1"
      },
      {
        "id": "7-11",
        "label": "7.11 Hệ thức Đệ quy LCS"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Kết hợp giới hạn độ sâu tách luồng (depth < 2, tối đa 4 luồng con) và khóa mutex cực ngắn chỉ quanh thao tác tra/ghi ô memo[i][j] giúp chương trình vừa chạy song song an toàn vừa tránh tạo bùng nổ hàng ngàn luồng.",
    "relatedQuestions": [
      "CR-38",
      "CR-41"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <string.h>\n#include <pthread.h>\n\nchar X[505], Y[505];\nint memo[505][505];\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;\n\nint lcs_memo(int i, int j) {\n    if (i == 0 || j == 0) return 0;\n\n    pthread_mutex_lock(&mtx);\n    int cached = memo[i][j];\n    pthread_mutex_unlock(&mtx);\n    if (cached != -1) return cached;\n\n    int res;\n    if (X[i - 1] == Y[j - 1]) {\n        res = 1 + lcs_memo(i - 1, j - 1);\n    } else {\n        int a = lcs_memo(i - 1, j);\n        int b = lcs_memo(i, j - 1);\n        res = (a > b) ? a : b;\n    }\n\n    pthread_mutex_lock(&mtx);\n    memo[i][j] = res;\n    pthread_mutex_unlock(&mtx);\n    return res;\n}\n\ntypedef struct {\n    int i, j, ans;\n} LcsArg;\n\nvoid *worker(void *arg) {\n    LcsArg *a = (LcsArg *)arg;\n    a->ans = lcs_memo(a->i, a->j);\n    return NULL;\n}\n\nint main() {\n    scanf(\"%s %s\", X, Y);\n    int m = strlen(X);\n    int n = strlen(Y);\n\n    memset(memo, -1, sizeof(memo));\n\n    if (X[m - 1] == Y[n - 1]) {\n        pthread_t t;\n        LcsArg arg = { m - 1, n - 1, 0 };\n        pthread_create(&t, NULL, worker, &arg);\n        pthread_join(t, NULL);\n        printf(\"%d\\n\", 1 + arg.ans);\n    } else {\n        pthread_t t1, t2;\n        LcsArg a1 = { m - 1, n, 0 };\n        LcsArg a2 = { m, n - 1, 0 };\n        pthread_create(&t1, NULL, worker, &a1);\n        pthread_create(&t2, NULL, worker, &a2);\n        pthread_join(t1, NULL);\n        pthread_join(t2, NULL);\n        int ans = (a1.ans > a2.ans) ? a1.ans : a2.ans;\n        printf(\"%d\\n\", ans);\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Tại nhánh bất khớp đầu tiên (depth < 1), chương trình tách 2 luồng tính song song LCS(i - 1, j) và LCS(i, j - 1) mà hoàn toàn không giữ khóa mutex trong lúc đợi pthread_join().",
      "Khởi chạy cả gốc từ một luồng pthread đảm bảo kể cả trong trường hợp hai xâu giống hệt nhau từ cuối về đầu, chương trình vẫn thực thi pthread_create/join đúng chuẩn."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h",
        "string.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "pthread_mutex_lock",
        "pthread_mutex_unlock",
        "memo"
      ],
      "forbiddenApis": [
        "fork"
      ],
      "qualityRules": [
        {
          "desc": "Khởi tạo bảng nhớ memo[][] bằng -1",
          "regex": "memset\\s*\\(\\s*memo\\s*,\\s*-\\s*1|memo\\s*\\[[^\\]]+\\]\\s*\\[[^\\]]+\\]\\s*=\\s*-\\s*1",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 4 (Pthreads & Đồng bộ Mutex vùng găng ngắn — Mục 4.9) + Chương 7 (Chuỗi con chung dài nhất LCS bằng Quy hoạch động Top-Down Memoization — Mục 7.11). Mở rộng từ mô hình Fibonacci 1 chiều (CR-41) sang bảng nhớ 2 chiều memo[m+1][n+1].",
      "idea": {
        "summary": "Để tìm độ dài Chuỗi con chung dài nhất (LCS) của hai chuỗi X (độ dài m) và Y (độ dài n) theo yêu cầu Top-Down Memoization kết hợp đa luồng, ta dùng bảng nhớ 2 chiều memo[505][505] (khởi tạo toàn bộ -1 bằng memset) và 1 khóa pthread_mutex_t mtx bảo vệ truy cập đọc/ghi. Tại tầng gốc trong main(): nếu X[m - 1] != Y[n - 1], ta tạo đúng 2 luồng chạy song song tính LCS(m - 1, n) và LCS(m, n - 1) dùng chung bảng nhớ memo[], rồi lấy max sau khi pthread_join(); nếu X[m - 1] == Y[n - 1], tạo 1 luồng tính LCS(m - 1, n - 1) rồi cộng 1. Mọi lời gọi đệ quy bên trong đều mở khóa mutex trước khi đệ quy để tránh Self-Deadlock.",
        "steps": [
          "Bước 1 — Khởi tạo bảng nhớ 2 chiều & mutex: Khai báo toàn cục char X[505], Y[505], int memo[505][505] và pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER. Dùng memset(memo, -1, sizeof(memo)) đánh dấu tất cả các ô 'chưa tính'.",
          "Bước 2 — Kiểm tra điều kiện cơ sở & tra cứu cache an toàn: Trong lcs_memo(i, j), nếu i == 0 || j == 0 trả về 0 ngay. Ngược lại khóa mtx → đọc cached = memo[i][j] → MỞ KHÓA mtx ngay; nếu cached != -1 thì trả về cached.",
          "Bước 3 — Tính công thức truy hồi LCS ngoài vùng găng: So sánh X[i - 1] và Y[j - 1] khi KHÔNG giữ mutex — nếu bằng nhau thì res = 1 + lcs_memo(i - 1, j - 1); nếu khác nhau thì res = max(lcs_memo(i - 1, j), lcs_memo(i, j - 1)).",
          "Bước 4 — Ghi lưu kết quả vào memo[i][j]: Sau khi tính xong res, khóa mtx → ghi memo[i][j] = res → mở khóa mtx rồi trả về res.",
          "Bước 5 — Tách luồng có kiểm soát tại lời gọi gốc (main): Nếu X[m - 1] != Y[n - 1], khởi chạy 2 luồng tính (m - 1, n) và (m, n - 1), join cả hai và in max(a1.ans, a2.ans); ngược lại chạy luồng tính (m - 1, n - 1), join và in 1 + arg.ans."
        ],
        "whyThisWay": "Giống như CR-41, hai cạm bẫy chết người của bài này là: (1) giữ khóa mutex xuyên qua lời gọi đệ quy gây Self-Deadlock treo chương trình ngay lập tức; và (2) gọi pthread_create() ở mọi bước đệ quy khiến số luồng bùng nổ theo hàm mũ làm hệ điều hành từ chối tạo luồng (EAGAIN). Việc chỉ tách tối đa 2 luồng ở lời gọi gốc và mở khóa ngay sau thao tác đọc/ghi bảng nhớ giải quyết triệt để cả hai rủi ro, trong khi 2 luồng vẫn thực sự phối hợp dùng chung bảng nhớ memo[][] được bảo vệ bằng mutex.",
        "complexity": "Thời gian: O(m · n) (tối đa 500 × 500 = 250.000 trạng thái) · Bộ nhớ: O(m · n) (mảng memo[505][505] ≈ 1 MB + stack đệ quy sâu tối đa m + n ≤ 1000) · Tài nguyên OS: 1 hoặc 2 luồng POSIX + 1 mutex"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–7",
          "title": "Khai báo thư viện, chuỗi đầu vào, bảng nhớ 2D & khóa mutex",
          "code": "#include <string.h>\n#include <pthread.h>\nchar X[505], Y[505];\nint memo[505][505];\npthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;",
          "explain": "Nạp <string.h> cho hàm strlen() và memset(), <pthread.h> cho Pthreads. Hai chuỗi X, Y có độ dài tối đa 500 nên kích thước 505 đủ chứa ký tự '\\0'. Mảng toàn cục memo[505][505] lưu độ dài LCS tối đa là 500 nên dùng kiểu int rất gọn (chiếm ~1 MB trên vùng nhớ tĩnh BSS, tránh tràn stack nếu khai báo cục bộ trong main). Khóa mtx khởi tạo tĩnh bảo vệ mọi đọc/ghi vào memo[][]."
        },
        {
          "lines": "Dòng 9–15",
          "title": "Điều kiện dừng & kiểm tra bảng nhớ trong vùng găng ngắn",
          "code": "if (i == 0 || j == 0) return 0;\npthread_mutex_lock(&mtx);\nint cached = memo[i][j];\npthread_mutex_unlock(&mtx);\nif (cached != -1) return cached;",
          "explain": "lcs_memo(i, j) định nghĩa là độ dài LCS của i ký tự đầu của X (X[0..i-1]) và j ký tự đầu của Y (Y[0..j-1]). Khi một trong hai tiền tố rỗng (i == 0 || j == 0), LCS chắc chắn bằng 0. Nếu không, khóa mtx để đọc memo[i][j] vào biến cục bộ cached rồi mở khóa ngay lập tức — nếu cached != -1 nghĩa là ô (i, j) đã được chính luồng này hoặc luồng kia tính rồi, ta trả về luôn không tính lại."
        },
        {
          "lines": "Dòng 17–24",
          "title": "Công thức truy hồi LCS thực hiện NGOÀI khóa mutex",
          "code": "if (X[i - 1] == Y[j - 1]) {\n    res = 1 + lcs_memo(i - 1, j - 1);\n} else {\n    int a = lcs_memo(i - 1, j);\n    int b = lcs_memo(i, j - 1);\n    res = (a > b) ? a : b;\n}",
          "explain": "So sánh hai ký tự cuối của hai tiền tố hiện tại là X[i - 1] và Y[j - 1] (vì chuỗi C đánh chỉ số từ 0). Nếu khớp nhau, ta lấy ký tự chung này (+1) và thu gọn cả hai chuỗi về (i - 1, j - 1). Nếu khác nhau, một trong hai ký tự cuối chắc chắn không thuộc LCS, nên lấy giá trị lớn hơn giữa nhánh bỏ ký tự cuối của X là (i - 1, j) và nhánh bỏ ký tự cuối của Y là (i, j - 1). Toàn bộ các lời gọi đệ quy này diễn ra khi KHÔNG giữ khóa mtx nên tuyệt đối không Deadlock."
        },
        {
          "lines": "Dòng 26–30",
          "title": "Lưu kết quả mới tính vào memo[i][j] có bảo vệ mutex",
          "code": "pthread_mutex_lock(&mtx);\nmemo[i][j] = res;\npthread_mutex_unlock(&mtx);\nreturn res;",
          "explain": "Khóa mtx, ghi lưu res vào ô memo[i][j] để chia sẻ kết quả cho cả hai luồng, sau đó mở khóa ngay và trả về res. Không bao giờ giữ khóa lâu hơn đúng 1 lệnh gán này."
        },
        {
          "lines": "Dòng 32–40",
          "title": "Cấu trúc tham số LcsArg & hàm luồng worker()",
          "code": "typedef struct { int i, j, ans; } LcsArg;\nvoid *worker(void *arg) {\n    LcsArg *a = (LcsArg *)arg;\n    a->ans = lcs_memo(a->i, a->j);\n    return NULL;\n}",
          "explain": "Đóng gói cặp tọa độ bài toán con (i, j) và ô lưu kết quả ans vào struct LcsArg. Hàm worker() ép kiểu con trỏ void *arg về LcsArg *, gọi lcs_memo(a->i, a->j) rồi gán trực tiếp kết quả vào a->ans."
        },
        {
          "lines": "Dòng 42–54",
          "title": "Đọc X, Y, khởi tạo memo bằng memset(-1) & nhánh ký tự cuối khớp",
          "code": "scanf(\"%s %s\", X, Y);\nint m = strlen(X), n = strlen(Y);\nmemset(memo, -1, sizeof(memo));\nif (X[m - 1] == Y[n - 1]) {\n    pthread_t t;\n    LcsArg arg = { m - 1, n - 1, 0 };\n    pthread_create(&t, NULL, worker, &arg);\n    pthread_join(t, NULL);\n    printf(\"%d\\n\", 1 + arg.ans);",
          "explain": "Đọc hai chuỗi không khoảng trắng X, Y và lấy độ dài m, n. Gọi memset(memo, -1, sizeof(memo)) để gán toàn bộ bảng nhớ thành -1 trong 1 dòng cực nhanh (hoạt động đúng với -1 vì trong biểu diễn bù 2, tất cả các byte đều là 0xFF ghép thành int 0xFFFFFFFF = -1; lưu ý mẹo memset chỉ dùng được cho 0 hoặc -1!). Nếu X[m - 1] == Y[n - 1], tạo 1 luồng tính bài toán con (m - 1, n - 1), chờ join xong rồi in 1 + arg.ans."
        },
        {
          "lines": "Dòng 55–67",
          "title": "Nhánh ký tự cuối khác nhau: chạy song song 2 luồng & in max",
          "code": "} else {\n    pthread_t t1, t2;\n    LcsArg a1 = { m - 1, n, 0 };\n    LcsArg a2 = { m, n - 1, 0 };\n    pthread_create(&t1, NULL, worker, &a1);\n    pthread_create(&t2, NULL, worker, &a2);\n    pthread_join(t1, NULL); pthread_join(t2, NULL);\n    int ans = (a1.ans > a2.ans) ? a1.ans : a2.ans;\n    printf(\"%d\\n\", ans);\n}",
          "explain": "Khi X[m - 1] != Y[n - 1], tạo 2 biến cấu trúc riêng a1 = (m - 1, n) và a2 = (m, n - 1), khởi chạy đồng thời 2 luồng t1, t2 cùng chia sẻ bảng nhớ memo[][] qua khóa mtx. Sau khi pthread_join() cả hai luồng hoàn tất (luồng chính không giữ mutex nào lúc join), lấy giá trị lớn hơn giữa a1.ans và a2.ans rồi in ra stdout."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ kinh điển có ký tự cuối trùng nhau",
          "caseDesc": "X = \"AGGTAB\", Y = \"GXTXAYB\" (cả hai kết thúc bằng 'B').",
          "howHandled": "Đi vào nhánh X[m-1] == Y[n-1], tạo luồng tính LCS(\"AGGTA\", \"GXTXAY\") = 3 → in 1 + 3 = 4 (chuỗi \"GTAB\")."
        },
        {
          "name": "Ký tự cuối khác nhau — kích hoạt 2 luồng song song",
          "caseDesc": "X = \"ABC\", Y = \"ABD\" ('C' != 'D').",
          "howHandled": "Tạo đồng thời 2 luồng tính LCS(\"AB\", \"ABD\") = 2 và LCS(\"ABC\", \"AB\") = 2, cùng dùng chung memo[][] → join xong in max(2, 2) = 2."
        },
        {
          "name": "Hai chuỗi hoàn toàn không có ký tự chung",
          "caseDesc": "X = \"AAAA\", Y = \"BBBB\".",
          "howHandled": "Hai luồng duyệt hết không gian trạng thái với memo[] chống lặp, kết quả trả về 0."
        },
        {
          "name": "Stress test độ dài tối đa (|X| = |Y| = 500)",
          "caseDesc": "Hai chuỗi dài 500 ký tự khác ký tự cuối.",
          "howHandled": "Tối đa 500 × 500 = 250.000 ô bảng nhớ, mỗi ô tính một lần và đồng bộ bằng Short Critical Section nên chạy rất nhanh không TLE và không tràn stack."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp <stdio.h>, <string.h>, <pthread.h>; khai báo toàn cục char X[505], Y[505], int memo[505][505] và pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER.",
        "Bước 2: Viết lcs_memo(i, j): if (i == 0 || j == 0) return 0; lock → đọc cached = memo[i][j] → unlock → if (cached != -1) return cached.",
        "Bước 3: Ngoài vùng găng, tính res bằng công thức LCS (khớp ký tự → 1 + lcs_memo(i-1, j-1); khác → max hai nhánh), rồi lock → ghi memo[i][j] = res → unlock → return res.",
        "Bước 4: Tạo struct LcsArg { int i, j, ans; } và hàm worker() gọi lcs_memo.",
        "Bước 5: Trong main(), đọc X, Y, gọi memset(memo, -1, sizeof(memo)); nếu X[m-1] == Y[n-1] tạo 1 luồng tính (m-1, n-1) rồi +1; ngược lại tạo 2 luồng tính (m-1, n) và (m, n-1), join cả hai rồi in max."
      ]
    }
  },
  {
    "num": 48,
    "id": "CR-48",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (File + Song song + Thread)",
    "difficulty": "Khó",
    "title": "Tính tổng byte của nhiều tệp song song bằng T luồng",
    "staticSummary": "Biên dịch với -pthread; sandbox tự tạo nhiều tệp; kiểm tra tĩnh pthread_create, pthread_join, open, read, close",
    "prompt": "Cho k đường dẫn tệp và số luồng T. Phân hoạch tĩnh danh sách k tệp cho tối đa min(k, T) luồng. Với mỗi tệp được giao có chỉ số idx (0 <= idx < k), luồng thực hiện mở tệp bằng open(..., O_RDONLY), đọc toàn bộ bằng read(), tính tổng giá trị nguyên không dấu (unsigned char, 0..255) của tất cả byte trong tệp rồi đóng close(), và ghi tổng vào file_sum[idx] (nếu không mở được tệp thứ idx thì đặt file_sum[idx] = -1). Sau pthread_join(), luồng chính in k kết quả file_sum[0..k-1] trên 1 dòng theo đúng thứ tự đầu vào.",
    "requirements": [
      "Sử dụng <pthread.h>, <fcntl.h>, <unistd.h>.",
      "Bắt buộc dùng pthread_create(), pthread_join() và system call open(), read(), close() cho từng tệp.",
      "Cấm fopen, fread, fgets; hỗ trợ tệp chứa byte '\\0' và tệp rỗng (tổng = 0).",
      "Không in khoảng trắng dư thừa cuối dòng."
    ],
    "inputSpec": "Dòng 1: hai số nguyên k T. k dòng tiếp theo: mỗi dòng là tên một tệp (không chứa khoảng trắng).",
    "outputSpec": "Một dòng gồm k số nguyên (long long) cách nhau 1 dấu cách (-1 tại vị trí tệp không mở được).",
    "constraints": [
      "1 <= k <= 32",
      "1 <= T <= 8",
      "0 <= kích thước mỗi tệp <= 10^6 byte"
    ],
    "example": {
      "note": "f1.bin (\"AB\" -> 131), missing.bin (-1), f3.bin ([0x00, 0xFF, 0x01] -> 256).",
      "input": "3 2\nf1.bin\nmissing.bin\nf3.bin",
      "output": "131 -1 256"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Đọc nhị phân unsigned char bằng open() / read() / close()"
      },
      {
        "id": "5-4",
        "label": "5.4 Phân hoạch danh sách tệp độc lập trên T luồng"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Mỗi luồng ghi kết quả của tệp idx vào đúng ô riêng file_sum[idx] nên dù các luồng hoàn thành khác thứ tự thời gian, mảng kết quả vẫn giữ nguyên thứ tự gốc 0..k-1 mà không cần mutex!",
    "relatedQuestions": [
      "CR-01",
      "CR-07",
      "CR-43"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <pthread.h>\n\nint k, T;\nchar paths[35][256];\nlong long file_sum[35];\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int nt = (T < k) ? T : k;\n    int base = k / nt, rem = k % nt;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);\n\n    unsigned char buf[4096];\n    for (int idx = start; idx < end; idx++) {\n        int fd = open(paths[idx], O_RDONLY);\n        if (fd < 0) {\n            file_sum[idx] = -1;\n            continue;\n        }\n        long long sum = 0;\n        ssize_t n;\n        while ((n = read(fd, buf, sizeof(buf))) > 0) {\n            for (ssize_t i = 0; i < n; i++) sum += buf[i];\n        }\n        close(fd);\n        file_sum[idx] = sum;\n    }\n    return NULL;\n}\n\nint main() {\n    scanf(\"%d %d\", &k, &T);\n    for (int i = 0; i < k; i++) scanf(\"%s\", paths[i]);\n\n    int nt = (T < k) ? T : k;\n    pthread_t th[16];\n    int ids[16];\n    for (int i = 0; i < nt; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);\n\n    for (int i = 0; i < k; i++) {\n        printf(\"%lld%s\", file_sum[i], (i == k - 1) ? \"\\n\" : \" \");\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Dùng mảng đệm unsigned char buf[8192] đảm bảo các byte nhị phân >= 0x80 (như 0xFF = 255) được cộng đúng giá trị không dấu.",
      "Đóng ngay mỗi fd sau khi tính xong tệp để không bao giờ chạm giới hạn số lượng File Descriptor mở tối đa của tiến trình."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h",
        "fcntl.h",
        "unistd.h"
      ],
      "requiredApis": [
        "pthread_create",
        "pthread_join",
        "open",
        "read",
        "close",
        "O_RDONLY"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fgets",
        "fscanf"
      ],
      "qualityRules": [
        {
          "desc": "Đọc byte không dấu bằng unsigned char / uint8_t",
          "regex": "unsigned\\s+char|uint8_t",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 (Đọc tệp nhị phân bằng System Call open/read/close — Mục 2.5) + Chương 4 & Chương 5 (Phân hoạch tĩnh danh sách tác vụ nhiều tệp cho T luồng — Mục 4.1, 5.4). Bài toán xử lý lô tệp (batch file processing) song song chuẩn chỉnh không cần mutex.",
      "idea": {
        "summary": "Cho k tệp đầu vào và T luồng, thay vì để các luồng chia nhau từng byte của 1 tệp như CR-43, ta phân hoạch trực tiếp danh sách k tệp cho nt = min(T, k) luồng sao cho mỗi luồng phụ trách một dải chỉ số tệp riêng [start, end). Với mỗi tệp idx được giao, luồng tự mở bằng open(paths[idx], O_RDONLY), đọc từng khối 4 KB vào mảng unsigned char (đảm bảo giá trị mỗi byte trong 0..255 kể cả 0x00 và 0xFF), cộng dồn vào sum rồi ghi kết quả vào đúng ô file_sum[idx] (hoặc -1 nếu không mở được). Cuối cùng luồng chính chờ pthread_join() xong hết rồi in k kết quả theo đúng thứ tự ban đầu.",
        "steps": [
          "Bước 1 — Đọc danh sách k tệp ở luồng chính: Đọc k, T và lưu k đường dẫn vào mảng toàn cục paths[35][256].",
          "Bước 2 — Tính số luồng thực tế nt = min(T, k): Tránh tạo luồng nhàn rỗi khi số luồng T lớn hơn số tệp k.",
          "Bước 3 — Phân hoạch tĩnh danh sách tệp [start, end): Chia đều k tệp cho nt luồng bằng công thức base = k / nt, rem = k % nt; mỗi chỉ số idx chỉ thuộc về duy nhất 1 luồng.",
          "Bước 4 — Xử lý từng tệp bằng System Call & unsigned char: Mở open(paths[idx], O_RDONLY); nếu lỗi (< 0) đặt file_sum[idx] = -1 và continue sang tệp tiếp theo; nếu mở được thì đọc lặp read() khối 4096 byte kiểu unsigned char, cộng dồn sum, đóng close(fd) và ghi file_sum[idx] = sum.",
          "Bước 5 — Đồng bộ & xuất kết quả chuẩn định dạng: Gọi pthread_join() cho cả nt luồng, sau đó in file_sum[0..k-1] cách nhau đúng 1 dấu cách và xuống dòng ở phần tử cuối (không dư dấu cách cuối dòng)."
        ],
        "whyThisWay": "Phân hoạch theo mức tệp (file-level parallelism) cực kỳ gọn và không cần khóa mutex vì mỗi luồng chỉ ghi vào dải ô file_sum[start..end-1] độc quyền của mình. Việc dùng kiểu unsigned char buf[4096] là bắt buộc: nếu khai báo nhầm char buf[4096] (kiểu có dấu trên x86_64 Linux), byte 0xFF sẽ có giá trị -1 thay vì 255 làm sai hoàn toàn tổng byte! Ngoài ra, đọc bằng read() theo số byte thực đọc n giúp xử lý hoàn hảo tệp nhị phân chứa byte '\\0' lẫn tệp rỗng 0 byte.",
        "complexity": "Thời gian: O(∑S_i / min(T, k)) (song song theo tổng dung lượng các tệp) · Bộ nhớ: O(k + min(T, k)) (mỗi luồng 4 KB buffer trên stack) · Tài nguyên OS: min(T, k) luồng + tối đa 1 FD đang mở trên mỗi luồng tại một thời điểm"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–8",
          "title": "Khai báo thư viện hệ thống & mảng đường dẫn/kết quả toàn cục",
          "code": "#include <fcntl.h>\n#include <unistd.h>\n#include <pthread.h>\nint k, T;\nchar paths[35][256];\nlong long file_sum[35];",
          "explain": "Nạp <stdio.h>, <fcntl.h> (open, O_RDONLY), <unistd.h> (read, close) và <pthread.h>. Với ràng buộc k ≤ 32, mảng paths[35][256] đủ chứa tên tối đa 32 tệp và mảng file_sum[35] dùng kiểu long long vì 1 tệp 10^6 byte toàn 0xFF có tổng tới 255 × 10^6 (đủ an toàn và đồng nhất yêu cầu output long long)."
        },
        {
          "lines": "Dòng 10–15",
          "title": "Chuẩn hóa số luồng nt = min(T, k) & phân hoạch dải tệp [start, end)",
          "code": "int tid = *(int *)arg;\nint nt = (T < k) ? T : k;\nint base = k / nt, rem = k % nt;\nint start = tid * base + (tid < rem ? tid : rem);\nint end = start + base + (tid < rem ? 1 : 0);",
          "explain": "Lấy mã luồng tid từ con trỏ arg và tính nt = min(T, k) khớp hoàn toàn với số luồng mà main() đã tạo. Chia đều k tệp thành nt đoạn chỉ số liên tiếp không giao nhau [start, end): rem luồng đầu xử lý base + 1 tệp, các luồng còn lại xử lý base tệp."
        },
        {
          "lines": "Dòng 17–23",
          "title": "Mở từng tệp được giao & bắt lỗi mở tệp (file_sum[idx] = -1)",
          "code": "unsigned char buf[4096];\nfor (int idx = start; idx < end; idx++) {\n    int fd = open(paths[idx], O_RDONLY);\n    if (fd < 0) { file_sum[idx] = -1; continue; }",
          "explain": "Khai báo bộ đệm cục bộ unsigned char buf[4096] trên stack riêng của từng luồng (mỗi phần tử có giá trị không dấu 0..255). Duyệt từng tệp idx từ start đến end - 1, gọi open(paths[idx], O_RDONLY). Nếu tệp không tồn tại hoặc không có quyền đọc (fd < 0), gán ngay file_sum[idx] = -1 rồi continue để xử lý các tệp còn lại trong dải (tuyệt đối không thoát sớm luồng!)."
        },
        {
          "lines": "Dòng 24–33",
          "title": "Đọc khối 4 KB, cộng dồn giá trị byte không dấu & đóng tệp",
          "code": "    long long sum = 0;\n    ssize_t n;\n    while ((n = read(fd, buf, sizeof(buf))) > 0) {\n        for (ssize_t i = 0; i < n; i++) sum += buf[i];\n    }\n    close(fd);\n    file_sum[idx] = sum;\n}",
          "explain": "Khởi tạo sum = 0. Vòng while ((n = read(fd, buf, sizeof(buf))) > 0) đọc liên tục từng khối tối đa 4096 byte cho đến khi gặp EOF (n == 0). Với tệp rỗng 0 byte, read() trả về 0 ngay từ lần đầu nên sum giữ nguyên 0 — đúng chuẩn. Vì buf[i] là unsigned char, phép cộng sum += buf[i] luôn cộng giá trị trong [0, 255] kể cả với byte 0x00 hay 0xFF. Đóng ngay close(fd) trước khi sang tệp kế tiếp để không vượt giới hạn số FD mở đồng thời của hệ thống, rồi lưu sum vào file_sum[idx]."
        },
        {
          "lines": "Dòng 35–46",
          "title": "Luồng chính đọc đầu vào, tạo nt luồng & chờ pthread_join()",
          "code": "scanf(\"%d %d\", &k, &T);\nfor (int i = 0; i < k; i++) scanf(\"%s\", paths[i]);\nint nt = (T < k) ? T : k;\nfor (int i = 0; i < nt; i++) { ids[i] = i; pthread_create(&th[i], NULL, worker, &ids[i]); }\nfor (int i = 0; i < nt; i++) pthread_join(th[i], NULL);",
          "explain": "Đọc số tệp k, số luồng T và k đường dẫn tệp vào mảng paths[]. Khởi chạy đúng nt = min(T, k) luồng, truyền địa chỉ phần tử riêng &ids[i] cho mỗi luồng, rồi gọi pthread_join() chờ toàn bộ nt luồng hoàn tất tính toán."
        },
        {
          "lines": "Dòng 48–52",
          "title": "In k kết quả đúng thứ tự, không dư khoảng trắng cuối dòng",
          "code": "for (int i = 0; i < k; i++) {\n    printf(\"%lld%s\", file_sum[i], (i == k - 1) ? \"\\n\" : \" \");\n}\nreturn 0;",
          "explain": "Nhờ mỗi luồng đã ghi kết quả vào đúng chỉ số gốc file_sum[idx], luồng chính chỉ cần duyệt i = 0..k-1 để in theo đúng thứ tự đầu vào bất chấp luồng nào xong trước hay xong sau. Biểu thức điều kiện (i == k - 1) ? \"\\n\" : \" \" đảm bảo các số cách nhau đúng 1 dấu cách và kết thúc bằng '\\n' mà không bị khoảng trắng thừa cuối dòng."
        }
      ],
      "testCases": [
        {
          "name": "Kết hợp tệp văn bản, tệp thiếu và tệp nhị phân 0x00/0xFF",
          "caseDesc": "k = 3, T = 2: f1 = \"AB\" (65+66=131), missing.bin, f3 = [0x00, 0xFF, 0x01] (0+255+1=256).",
          "howHandled": "f1 ra 131, missing.bin báo -1 nhưng không làm dừng luồng, f3 đọc unsigned char ra 256 → in \"131 -1 256\"."
        },
        {
          "name": "Tệp rỗng 0 byte",
          "caseDesc": "Một tệp tồn tại nhưng có kích thước 0 byte.",
          "howHandled": "open() thành công, vòng while(read) thực hiện 0 lần → ghi file_sum[idx] = 0."
        },
        {
          "name": "Số luồng lớn hơn số tệp (T > k)",
          "caseDesc": "k = 2 tệp nhưng T = 8 luồng.",
          "howHandled": "nt = min(8, 2) = 2 nên chỉ tạo đúng 2 luồng, mỗi luồng xử lý 1 tệp."
        },
        {
          "name": "Tất cả các tệp đều lỗi (không tồn tại)",
          "caseDesc": "k = 3 tệp đều không tồn tại, T = 3.",
          "howHandled": "Cả 3 luồng gán -1 → in \"-1 -1 -1\"."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp <stdio.h>, <fcntl.h>, <unistd.h>, <pthread.h>; khai báo toàn cục k, T, char paths[35][256] và long long file_sum[35].",
        "Bước 2: Viết worker(): tính nt = min(T, k) và dải [start, end); khai báo unsigned char buf[4096] (NHỚ từ khóa unsigned!).",
        "Bước 3: Với từng idx trong [start, end): gọi open(paths[idx], O_RDONLY); nếu < 0 đặt file_sum[idx] = -1 và continue; ngược lại lặp read(), cộng buf[i] vào sum, close(fd) và gán file_sum[idx] = sum.",
        "Bước 4: Trong main(), đọc k, T, paths[]; tạo nt = min(T, k) luồng với mảng ids[16] và gọi pthread_join() toàn bộ.",
        "Bước 5: In file_sum[0..k-1] với định dạng \"%lld%s\" và (i == k - 1) ? \"\\n\" : \" \" để không dư dấu cách."
      ]
    }
  },
  {
    "num": 49,
    "id": "CR-49",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (Process + Signal + File)",
    "difficulty": "Khó",
    "title": "Tiến trình con lọc tệp nhị phân bằng System Call và báo hiệu qua SIGUSR1",
    "staticSummary": "Kiểm tra cả tệp đích và stdout; kiểm tra tĩnh fork, kill, sigaction/signal, waitpid, open, read, write, stat",
    "prompt": "Cho đường dẫn tệp nguồn src_path và tệp đích dst_path. Trước khi gọi fork(), tiến trình cha cài đặt signal handler cho SIGUSR1 (cập nhật cờ volatile sig_atomic_t got_sig = 0 lên 1). Tiến trình con mở src_path bằng open(..., O_RDONLY): nếu không mở được thì thoát ngay với _exit(1) (không gửi tín hiệu); ngược lại đọc từng byte của src_path bằng read(), chỉ giữ lại các byte ký tự ASCII in được (32 <= b <= 126) hoặc ký tự xuống dòng '\\n' (mã 10), ghi kết quả vào dst_path bằng open(..., O_WRONLY | O_CREAT | O_TRUNC, 0644), write(), close(), rồi gửi tín hiệu hoàn tất kill(getppid(), SIGUSR1) trước khi _exit(0). Cha thu gom con bằng waitpid(): nếu con thoát khác 0 in -1 -1; ngược lại dùng stat() lấy kích thước dst_path và in <got_sig> <kích_thước_tệp_đích>.",
    "requirements": [
      "Sử dụng <unistd.h>, <signal.h>, <sys/wait.h>, <fcntl.h>, <sys/stat.h>.",
      "Bắt buộc dùng fork(), sigaction()/signal(), kill(), waitpid(), stat(), open(), read(), write(), close().",
      "Đăng ký signal handler TRƯỚC khi gọi fork() để tránh mất tín hiệu; cấm fopen, fread, fwrite."
    ],
    "inputSpec": "Một dòng gồm: src_path dst_path.",
    "outputSpec": "Hai số nguyên trên 1 dòng: got_sig dst_size (hoặc -1 -1 nếu lỗi mở src_path).",
    "constraints": [
      "Độ dài mỗi tên tệp <= 128 ký tự",
      "0 <= kích thước src_path <= 10^6 byte"
    ],
    "example": {
      "note": "9 byte gốc \"Hi!\\x00\\x01\\x7F\\nOK\" sau khi lọc bỏ 3 byte điều khiển còn 6 byte \"Hi!\\nOK\".",
      "input": "raw49.bin clean49.txt",
      "output": "1 6"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Lọc luồng byte nhị phân qua open / read / write"
      },
      {
        "id": "3-6",
        "label": "3.6 Kiểm tra mã thoát con bằng waitpid & WEXITSTATUS"
      },
      {
        "id": "3-7",
        "label": "3.7 Cài đặt sigaction() trước fork() & tránh EINTR trên waitpid()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Hai chi tiết kỹ thuật cực kỳ quan trọng: (1) Nếu waitpid() đang chạy mà nhận tín hiệu SIGUSR1 không bật SA_RESTART, waitpid() có thể trả về -1 với errno == EINTR — nên bọc waitpid() trong vòng lặp while (errno == EINTR) hoặc đặt cờ SA_RESTART; (2) Chặn tạm SIGUSR1 trước fork() rồi mở chặn sau waitpid() đảm bảo tín hiệu pending luôn được xử lý 100% trước khi in got_sig!",
    "relatedQuestions": [
      "CR-03",
      "CR-14",
      "CR-16"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <signal.h>\n#include <sys/stat.h>\n#include <sys/wait.h>\n\nvolatile sig_atomic_t got_sig = 0;\n\nvoid handle_sigusr1(int sig) {\n    (void)sig;\n    got_sig = 1;\n}\n\nint main() {\n    char src[256], dst[256];\n    scanf(\"%s %s\", src, dst);\n\n    // Dang ky signal handler TRUOC khi goi fork()\n    signal(SIGUSR1, handle_sigusr1);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        int fd_in = open(src, O_RDONLY);\n        if (fd_in < 0) {\n            _exit(1);\n        }\n\n        int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\n        if (fd_out < 0) {\n            close(fd_in);\n            _exit(1);\n        }\n\n        unsigned char in_buf[4096], out_buf[4096];\n        ssize_t n;\n        while ((n = read(fd_in, in_buf, sizeof(in_buf))) > 0) {\n            int out_len = 0;\n            for (ssize_t i = 0; i < n; i++) {\n                unsigned char b = in_buf[i];\n                if ((b >= 32 && b <= 126) || b == '\\n') {\n                    out_buf[out_len++] = b;\n                }\n            }\n            int off = 0;\n            while (off < out_len) {\n                ssize_t w = write(fd_out, out_buf + off, out_len - off);\n                if (w <= 0) break;\n                off += w;\n            }\n        }\n\n        close(fd_in);\n        close(fd_out);\n        kill(getppid(), SIGUSR1);\n        _exit(0);\n    } else {\n        int status;\n        waitpid(pid, &status, 0);\n\n        if (!WIFEXITED(status) || WEXITSTATUS(status) != 0) {\n            printf(\"-1 -1\\n\");\n        } else {\n            struct stat st;\n            stat(dst, &st);\n            printf(\"%d %lld\\n\", (int)got_sig, (long long)st.st_size);\n        }\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Gom các byte hợp lệ (32 <= b <= 126 hoặc b == 10) vào mảng đệm lọc out_buf[8192] rồi mới gọi write_all() theo khối giúp tốc độ lọc tệp 1 MB chỉ mất < 1 ms.",
      "Chặn SIGUSR1 trước fork() và mở chặn ngay sau waitpid() đảm bảo tín hiệu pending luôn kích hoạt hàm on_usr1() đồng bộ trước khi đọc biến got_sig."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "signal.h",
        "sys/wait.h",
        "fcntl.h",
        "sys/stat.h"
      ],
      "requiredApis": [
        "fork",
        "kill",
        "waitpid",
        "stat",
        "open",
        "read",
        "write",
        "close",
        "SIGUSR1"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fwrite"
      ],
      "qualityRules": [
        {
          "desc": "Khai báo cờ tín hiệu volatile sig_atomic_t",
          "regex": "volatile\\s+sig_atomic_t",
          "flags": ""
        },
        {
          "desc": "Lọc đúng miền ASCII in được [32..126] và ký tự xuống dòng (10 hoặc \\n)",
          "regex": "32[\\s\\S]*126",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 (Đọc/ghi lọc byte bằng System Call & stat() — Mục 2.5, 2.7) + Chương 3 (Tạo tiến trình fork(), báo hiệu bất đồng bộ bằng Signal SIGUSR1 & kiểm tra mã thoát waitpid() — Mục 3.6, 3.7). Bài toán tổng hợp rất hay gặp về thứ tự đăng ký Signal Handler chống Race Condition.",
      "idea": {
        "summary": "Tiến trình cha muốn giao cho tiến trình con lọc toàn bộ các ký tự ASCII in được (32..126) và dấu xuống dòng '\\n' (10) từ tệp nguồn src_path sang tệp đích dst_path, đồng thời xác nhận hoàn tất bằng tín hiệu SIGUSR1. Nguyên tắc sống còn của lập trình hệ thống: cha PHẢI đăng ký hàm xử lý tín hiệu signal(SIGUSR1, handle_sigusr1) TRƯỚC khi gọi fork() (tránh trường hợp con chạy nhanh quá gửi SIGUSR1 trước khi cha kịp cài handler làm hệ điều hành giết chết tiến trình cha!). Sau khi waitpid() thu gom con, cha kiểm tra mã thoát WEXITSTATUS: nếu con thoát khác 0 thì in \"-1 -1\"; nếu thoát 0 thì gọi stat(dst) lấy kích thước tệp đích và in \"<got_sig> <dst_size>\".",
        "steps": [
          "Bước 1 — Khai báo cờ tín hiệu an toàn & hàm handler: Khai báo biến toàn cục volatile sig_atomic_t got_sig = 0 và hàm handle_sigusr1(int sig) chỉ làm duy nhất một việc an toàn bất đồng bộ (async-signal-safe) là đặt got_sig = 1.",
          "Bước 2 — Đăng ký handler TRƯỚC khi gọi fork(): Đọc src, dst từ stdin, gọi signal(SIGUSR1, handle_sigusr1) ngay tại cha trước khi gọi fork() để loại bỏ hoàn toàn race condition mất tín hiệu hoặc bị giết tiến trình.",
          "Bước 3 — Nhánh con mở tệp bằng System Call: Con mở src với O_RDONLY (lỗi thì _exit(1) ngay, không gửi tín hiệu), sau đó mở dst với O_WRONLY | O_CREAT | O_TRUNC quyền 0644 (lỗi thì close(fd_in) và _exit(1)).",
          "Bước 4 — Lọc byte theo khối & ghi chống short write: Đọc in_buf[4096], chỉ sao chép các byte thỏa (b >= 32 && b <= 126) || b == '\\n' vào out_buf[4096], rồi dùng vòng while(write) ghi toàn bộ out_len byte ra fd_out.",
          "Bước 5 — Con đóng tệp, bắn SIGUSR1 về cha & _exit(0): Sau khi lọc xong, con gọi close(fd_in), close(fd_out), gọi kill(getppid(), SIGUSR1) để báo hiệu cho cha rồi kết thúc bằng _exit(0).",
          "Bước 6 — Cha waitpid(), kiểm tra trạng thái thoát & gọi stat(dst): Cha chờ con kết thúc qua waitpid(pid, &status, 0); nếu !WIFEXITED(status) || WEXITSTATUS(status) != 0 in \"-1 -1\", ngược lại gọi stat(dst, &st) và in got_sig cùng st.st_size."
        ],
        "whyThisWay": "Hành động mặc định (default disposition) của SIGUSR1 trên Linux là KẾT THÚC TIẾN TRÌNH (Terminate). Nếu cài signal() sau fork(), bộ lập lịch OS có thể cho con chạy xong và gọi kill(getppid(), SIGUSR1) trước khi cha chạy đến dòng cài signal() — cha sẽ bị chết ngay lập tức! Biến got_sig bắt buộc có kiểu volatile sig_atomic_t để trình biên dịch không tối ưu hóa (cache vào thanh ghi CPU) và đảm bảo đọc/ghi nguyên tử khi bị ngắt bởi tín hiệu. Gom các byte hợp lệ vào out_buf rồi mới gọi write() một lần cho mỗi khối 4 KB nhanh gấp hàng nghìn lần so với gọi write() 1 byte một.",
        "complexity": "Thời gian: O(S) (duyệt tuyến tính S byte của tệp nguồn theo khối 4 KB) · Bộ nhớ: O(1) (2 buffer 4 KB) · Tài nguyên OS: 1 tiến trình con + 2 File Descriptor + 1 tín hiệu SIGUSR1"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–13",
          "title": "Khai báo thư viện, cờ volatile sig_atomic_t & hàm xử lý SIGUSR1",
          "code": "#include <signal.h>\nvolatile sig_atomic_t got_sig = 0;\nvoid handle_sigusr1(int sig) {\n    (void)sig;\n    got_sig = 1;\n}",
          "explain": "Nạp đủ 6 thư viện hệ thống (<stdio.h>, <fcntl.h>, <unistd.h>, <signal.h>, <sys/stat.h>, <sys/wait.h>). Biến got_sig dùng kiểu chuẩn POSIX volatile sig_atomic_t: từ khóa volatile buộc CPU luôn đọc lại giá trị mới nhất từ RAM (không giữ bản cũ trong thanh ghi), còn sig_atomic_t đảm bảo thao tác gán = 1 là nguyên tử không bị xé dở khi tín hiệu ngắt. Trong handler, (void)sig tránh cảnh báo biên dịch tham số không dùng, và tuyệt đối không gọi printf() bên trong signal handler vì printf không async-signal-safe."
        },
        {
          "lines": "Dòng 15–22",
          "title": "Đọc đường dẫn, đăng ký handler TRƯỚC fork() & tạo tiến trình con",
          "code": "char src[256], dst[256];\nscanf(\"%s %s\", src, dst);\nsignal(SIGUSR1, handle_sigusr1);\npid_t pid = fork();",
          "explain": "Đọc src và dst từ stdin. Gọi signal(SIGUSR1, handle_sigusr1) TRƯỚC khi gọi fork() là bước then chốt nhất của bài: ngay tại thời điểm con bắt đầu chạy, tiến trình cha đã sẵn sàng đón SIGUSR1 mà không bao giờ bị giết oan hay bỏ lỡ tín hiệu."
        },
        {
          "lines": "Dòng 23–33",
          "title": "Nhánh con mở tệp nguồn & tệp đích, thoát _exit(1) nếu lỗi",
          "code": "int fd_in = open(src, O_RDONLY);\nif (fd_in < 0) _exit(1);\nint fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\nif (fd_out < 0) { close(fd_in); _exit(1); }",
          "explain": "Con mở tệp nguồn ở chế độ chỉ đọc; nếu thất bại thì thoát ngay bằng _exit(1) mà KHÔNG gọi kill() và KHÔNG tạo tệp đích dst. Nếu mở nguồn thành công mới tạo/ghi đè tệp đích dst với cờ O_WRONLY | O_CREAT | O_TRUNC và quyền 0644; nếu mở đích lỗi thì đóng fd_in trước rồi mới _exit(1)."
        },
        {
          "lines": "Dòng 35–44",
          "title": "Đọc theo khối 4 KB & lọc byte ASCII in được hoặc '\\n' vào out_buf",
          "code": "unsigned char in_buf[4096], out_buf[4096];\nwhile ((n = read(fd_in, in_buf, sizeof(in_buf))) > 0) {\n    int out_len = 0;\n    for (ssize_t i = 0; i < n; i++) {\n        unsigned char b = in_buf[i];\n        if ((b >= 32 && b <= 126) || b == '\\n') out_buf[out_len++] = b;\n    }",
          "explain": "Dùng mảng unsigned char để mọi byte nhị phân đều có giá trị rõ ràng trong 0..255. Với mỗi khối n byte đọc được, duyệt từng byte b: chỉ giữ lại các ký tự ASCII in được từ mã 32 (dấu cách ' ') đến mã 126 ('~') hoặc ký tự xuống dòng '\\n' (mã 10); mọi byte điều khiển (0x00..0x09, 0x0B..0x1F, 0x7F) và byte mở rộng (128..255) đều bị loại bỏ. Gom toàn bộ byte hợp lệ vào out_buf[0..out_len-1]."
        },
        {
          "lines": "Dòng 45–51",
          "title": "Ghi trọn vẹn khối out_buf ra tệp đích chống short write",
          "code": "    int off = 0;\n    while (off < out_len) {\n        ssize_t w = write(fd_out, out_buf + off, out_len - off);\n        if (w <= 0) break;\n        off += w;\n    }\n}",
          "explain": "Vòng while (off < out_len) đẩy toàn bộ out_len byte đã lọc ra tệp đích fd_out, xử lý an toàn trường hợp write() ghi từng phần. Nếu khối hiện tại toàn byte rác (out_len == 0), vòng while không thực thi và không tạo system call write() dư thừa."
        },
        {
          "lines": "Dòng 53–56",
          "title": "Đóng tệp, gửi tín hiệu hoàn tất SIGUSR1 về cha & _exit(0)",
          "code": "close(fd_in);\nclose(fd_out);\nkill(getppid(), SIGUSR1);\n_exit(0);",
          "explain": "Đóng cả hai File Descriptor để đảm bảo dữ liệu đã xả vào page cache của hệ điều hành TRƯỚC khi báo tin cho cha. Sau đó gọi getppid() lấy PID của tiến trình cha và gửi tín hiệu SIGUSR1 qua kill(getppid(), SIGUSR1), cuối cùng kết thúc thành công bằng _exit(0)."
        },
        {
          "lines": "Dòng 57–70",
          "title": "Nhánh cha thu gom con qua waitpid(), gọi stat(dst) & in kết quả",
          "code": "int status;\nwaitpid(pid, &status, 0);\nif (!WIFEXITED(status) || WEXITSTATUS(status) != 0) {\n    printf(\"-1 -1\\n\");\n} else {\n    struct stat st;\n    stat(dst, &st);\n    printf(\"%d %lld\\n\", (int)got_sig, (long long)st.st_size);\n}",
          "explain": "Cha gọi waitpid(pid, &status, 0) chờ con kết thúc và nhận mã trạng thái vào status. Kiểm tra chuẩn POSIX bằng bộ đôi macro: WIFEXITED(status) xác nhận con kết thúc bình thường (không bị signal giết) và WEXITSTATUS(status) == 0 xác nhận con không trả mã lỗi 1. Nếu có lỗi in \"-1 -1\"; nếu thành công thì gọi stat(dst, &st) lấy kích thước chính xác của tệp đích đã lọc và in (int)got_sig cùng (long long)st.st_size."
        }
      ],
      "testCases": [
        {
          "name": "Tệp nhị phân trộn ký tự điều khiển và byte NULL",
          "caseDesc": "src chứa \"Hi!\\x00\\x01\\x7F\\nOK\" (9 byte).",
          "howHandled": "Các byte 0x00, 0x01, 0x7F bị lọc bỏ; tệp đích chứa đúng \"Hi!\\nOK\" (6 byte), con bắn SIGUSR1 → cha in \"1 6\"."
        },
        {
          "name": "Tệp nguồn chứa toàn byte nhị phân không in được (hoặc tệp rỗng)",
          "caseDesc": "src chứa [0x00, 0x01, 0xFF, 0x7F] hoặc 0 byte.",
          "howHandled": "Tệp đích dst được tạo ra với kích thước 0 byte, con vẫn gửi SIGUSR1 và _exit(0) → cha in \"1 0\"."
        },
        {
          "name": "Tệp nguồn không tồn tại",
          "caseDesc": "src = missing.bin.",
          "howHandled": "Con gọi _exit(1) ngay lập tức không bắn SIGUSR1 → cha thấy WEXITSTATUS(status) == 1 → in \"-1 -1\"."
        },
        {
          "name": "Kiểm chứng thứ tự đăng ký handler (con chạy xong rất nhanh)",
          "caseDesc": "Tệp nhỏ vài byte khiến con bắn SIGUSR1 chỉ sau vài micro-giây.",
          "howHandled": "Vì cha đã đăng ký signal(SIGUSR1, handle_sigusr1) TRƯỚC fork(), cha không bao giờ chết vì tín hiệu đến sớm và luôn ghi nhận got_sig = 1."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp đủ 6 header (<stdio.h>, <fcntl.h>, <unistd.h>, <signal.h>, <sys/stat.h>, <sys/wait.h>); khai báo volatile sig_atomic_t got_sig = 0 và handler đặt got_sig = 1.",
        "Bước 2: Trong main(), đọc src, dst rồi gọi signal(SIGUSR1, handle_sigusr1) TRƯỚC fork().",
        "Bước 3: Nhánh con: open(src, O_RDONLY) < 0 → _exit(1); open(dst, O_WRONLY|O_CREAT|O_TRUNC, 0644) < 0 → close(fd_in), _exit(1).",
        "Bước 4: Nhánh con lọc in_buf[4096] với điều kiện (b >= 32 && b <= 126) || b == '\\n' vào out_buf[4096], ghi bằng vòng while(write), close cả hai FD, gọi kill(getppid(), SIGUSR1) rồi _exit(0).",
        "Bước 5: Nhánh cha: waitpid(pid, &status, 0); kiểm tra !WIFEXITED(status) || WEXITSTATUS(status) != 0 → in \"-1 -1\"; ngược lại gọi stat(dst, &st) và in (int)got_sig cùng (long long)st.st_size."
      ]
    }
  },
  {
    "num": 50,
    "id": "CR-50",
    "part": "Tổng hợp",
    "partLabel": "Phần 6 · Bài toán Tổng hợp Đa chủ đề (File + Song song + DP)",
    "difficulty": "Khó",
    "title": "Giải hàng loạt bài toán Cắt thanh gỗ từ tệp bằng T luồng và xuất ra tệp",
    "staticSummary": "Biên dịch với -pthread; kiểm tra cả tệp đích lẫn stdout; kiểm tra tĩnh open, read, write, close, pthread_create, pthread_join",
    "prompt": "Cho tệp đầu vào src_path, tệp kết quả dst_path và số luồng T. Chương trình phải dùng system call mức thấp (open, read, close; cấm fopen/fscanf) đọc từ src_path gồm Q bộ dữ liệu Cắt thanh gỗ: dòng đầu chứa Q; mỗi bộ tiếp theo gồm 1 dòng chứa n_q và 1 dòng chứa n_q số nguyên là bảng giá p[1..n_q]. Tiếp theo, dùng T luồng pthread phân hoạch tĩnh Q bộ dữ liệu để tính song song doanh thu tối đa ans[q] cho từng thanh gỗ bằng Quy hoạch động Tabulation (mỗi luồng tự cấp phát mảng DP cục bộ, không tranh chấp dữ liệu). Sau pthread_join(), dùng open(O_WRONLY | O_CREAT | O_TRUNC, 0644), write(), close() ghi Q kết quả ra dst_path (mỗi dòng 1 số) và in tổng của Q kết quả ra stdout (nếu không mở được src_path chỉ in -1).",
    "requirements": [
      "Sử dụng <pthread.h>, <fcntl.h>, <unistd.h>, <sys/stat.h>.",
      "Bắt buộc dùng open(), read(), write(), close() cho tệp và pthread_create(), pthread_join() cho T luồng xử lý song song.",
      "Cấm fopen, fscanf, fprintf, fread, fwrite; mỗi bài toán dùng DP O(n_q^2).",
      "Chương trình chỉ in đúng 1 số nguyên (long long) ra stdout và ghi Q dòng đáp án ra tệp dst_path."
    ],
    "inputSpec": "Một dòng chứa: src_path dst_path T.",
    "outputSpec": "Một số nguyên (long long) là tổng doanh thu tối đa của cả Q bộ dữ liệu (tệp dst_path chứa Q dòng kết quả).",
    "constraints": [
      "1 <= Q <= 100",
      "1 <= n_q <= 500",
      "0 <= p_i <= 10^5",
      "1 <= T <= 8"
    ],
    "example": {
      "note": "Bộ 1 (n=4: 1 5 8 9) đạt 10; Bộ 2 (n=5: 2 5 7 8 10) đạt 12 -> tổng = 22, out50.txt chứa \"10\\n12\\n\".",
      "input": "batch50.txt out50.txt 2",
      "output": "22"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Đọc/ghi tệp bằng System Call thuần không qua stdio"
      },
      {
        "id": "5-4",
        "label": "5.4 Phân hoạch lô bài toán độc lập (Task/Data Parallelism)"
      },
      {
        "id": "7-8",
        "label": "7.8 Quy hoạch động Rod Cutting O(n^2)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Bài tổng kết cuối ngân hàng hội tụ cả 3 trụ cột lớn (System Call File I/O + Đa luồng Song song Pthreads + Quy hoạch động). Mỗi luồng khai báo mảng cục bộ long long dp[505] ngay trên Stack riêng của luồng nên hoàn toàn độc lập, không cần khóa mutex!",
    "relatedQuestions": [
      "CR-34",
      "CR-44",
      "CR-48"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n#include <pthread.h>\n\nint Q, T;\nint rod_n[105];\nlong long rod_p[105][505];\nlong long ans[105];\n\nlong long next_ll(const char *s, int *pos, int len) {\n    while (*pos < len && (s[*pos] == ' ' || s[*pos] == '\\n' || s[*pos] == '\\r' || s[*pos] == '\\t')) {\n        (*pos)++;\n    }\n    long long val = 0;\n    while (*pos < len && s[*pos] >= '0' && s[*pos] <= '9') {\n        val = val * 10 + (s[*pos] - '0');\n        (*pos)++;\n    }\n    return val;\n}\n\nvoid *worker(void *arg) {\n    int tid = *(int *)arg;\n    int nt = (T < Q) ? T : Q;\n    int base = Q / nt, rem = Q % nt;\n    int start = tid * base + (tid < rem ? tid : rem);\n    int end = start + base + (tid < rem ? 1 : 0);\n\n    long long dp[505];\n    for (int q = start; q < end; q++) {\n        int n = rod_n[q];\n        dp[0] = 0;\n        for (int j = 1; j <= n; j++) {\n            long long best = 0;\n            for (int i = 1; i <= j; i++) {\n                if (rod_p[q][i] + dp[j - i] > best) {\n                    best = rod_p[q][i] + dp[j - i];\n                }\n            }\n            dp[j] = best;\n        }\n        ans[q] = dp[n];\n    }\n    return NULL;\n}\n\nint main() {\n    char src[256], dst[256];\n    scanf(\"%s %s %d\", src, dst, &T);\n\n    int fd_in = open(src, O_RDONLY);\n    if (fd_in < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    struct stat st;\n    fstat(fd_in, &st);\n    int len = (int)st.st_size;\n    char *text = (char *)malloc(len + 1);\n\n    int got = 0;\n    while (got < len) {\n        ssize_t n = read(fd_in, text + got, len - got);\n        if (n <= 0) break;\n        got += n;\n    }\n    text[got] = '\\0';\n    close(fd_in);\n\n    int pos = 0;\n    Q = (int)next_ll(text, &pos, got);\n    for (int q = 0; q < Q; q++) {\n        rod_n[q] = (int)next_ll(text, &pos, got);\n        for (int i = 1; i <= rod_n[q]; i++) {\n            rod_p[q][i] = next_ll(text, &pos, got);\n        }\n    }\n    free(text);\n\n    int nt = (T < Q) ? T : Q;\n    pthread_t th[16];\n    int ids[16];\n    for (int i = 0; i < nt; i++) {\n        ids[i] = i;\n        pthread_create(&th[i], NULL, worker, &ids[i]);\n    }\n    for (int i = 0; i < nt; i++) pthread_join(th[i], NULL);\n\n    int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\n    long long total = 0;\n    char line[64];\n    for (int q = 0; q < Q; q++) {\n        total += ans[q];\n        int l = snprintf(line, sizeof(line), \"%lld\\n\", ans[q]);\n        int off = 0;\n        while (off < l) {\n            ssize_t w = write(fd_out, line + off, l - off);\n            if (w <= 0) break;\n            off += w;\n        }\n    }\n    close(fd_out);\n\n    printf(\"%lld\\n\", total);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Mảng cục bộ long long dp[505] nằm trên Stack riêng của từng luồng nên T luồng giải song song Q bài toán Cắt thanh gỗ mà không hề có tranh chấp bộ nhớ hay False Sharing.",
      "Kết quả từng bài được ghi vào ans[q] theo đúng thứ tự truy vấn, xuất ra dst_path bằng write() và in tổng ra stdout."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11 -pthread",
      "requiredHeaders": [
        "pthread.h",
        "fcntl.h",
        "unistd.h"
      ],
      "requiredApis": [
        "open",
        "read",
        "write",
        "close",
        "pthread_create",
        "pthread_join",
        "O_CREAT",
        "O_TRUNC"
      ],
      "forbiddenApis": [
        "fopen",
        "fscanf",
        "fprintf",
        "fread",
        "fwrite",
        "fgets"
      ],
      "qualityRules": [
        {
          "desc": "Mỗi luồng dùng mảng DP cục bộ riêng để tính O(n_q^2)",
          "regex": "dp\\s*\\[",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 (Đọc/ghi tệp hoàn toàn bằng System Call — Mục 2.5) + Chương 5 (Phân hoạch tĩnh song song T luồng không tranh chấp — Mục 5.4) + Chương 7 (Quy hoạch động Cắt thanh gỗ Rod Cutting — Mục 7.8). Bài toán tổng hợp tối thượng kết hợp cả 3 trụ cột cốt lõi của ELT 3296 vào một đường ống hoàn chỉnh.",
      "idea": {
        "summary": "Bài toán yêu cầu xử lý hàng loạt Q bài toán Cắt thanh gỗ (Rod Cutting) đọc từ tệp nguồn src_path, giải song song bằng T luồng và xuất Q đáp án ra tệp đích dst_path hoàn toàn bằng System Call POSIX. Ta thiết kế đường ống 3 chặng tách bạch: (1) Luồng chính mở src_path bằng open/fstat/read, nạp toàn bộ vào bộ đệm RAM và dùng hàm next_ll() tách Q bộ dữ liệu vào mảng rod_n[], rod_p[][]; (2) Khởi chạy nt = min(T, Q) luồng, mỗi luồng phụ trách một dải bài toán độc lập [start, end) và dùng mảng DP cục bộ long long dp[505] ngay trên stack riêng để giải Rod Cutting O(n_q^2) mà hoàn toàn không cần mutex; (3) Sau pthread_join(), luồng chính mở dst_path với quyền 0644, ghi từng dòng ans[q] bằng write(), đóng tệp và in tổng tất cả Q kết quả ra stdout.",
        "steps": [
          "Bước 1 — Đọc tệp nguồn bằng System Call: Mở src bằng open(src, O_RDONLY) (lỗi → in -1 và thoát ngay). Dùng fstat() lấy độ dài tệp, cấp phát text = malloc(len + 1), lặp read() đọc đủ byte rồi đóng close(fd_in).",
          "Bước 2 — Phân tích Q bộ dữ liệu vào mảng toàn cục: Dùng hàm tự viết next_ll() đọc Q, rồi với mỗi q = 0..Q-1 đọc độ dài rod_n[q] và bảng giá rod_p[q][1..n_q], sau đó free(text) giải phóng ngay bộ nhớ chuỗi thô.",
          "Bước 3 — Phân hoạch tĩnh Q bài toán cho nt = min(T, Q) luồng: Chia đều Q bài toán thành nt đoạn chỉ số rời nhau [start, end) sao cho mỗi bộ dữ liệu q chỉ do đúng 1 luồng xử lý.",
          "Bước 4 — Giải song song Rod Cutting với mảng DP cục bộ trên stack: Trong mỗi luồng, khai báo riêng long long dp[505] trên stack; với mỗi q trong [start, end), chạy Tabulation dp[j] = max_{1 ≤ i ≤ j} (rod_p[q][i] + dp[j - i]) và ghi ans[q] = dp[n] không cần khóa mutex.",
          "Bước 5 — Đồng bộ & xuất tệp đích + stdout: Gọi pthread_join() chờ cả nt luồng hoàn tất. Mở dst bằng open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644), duyệt q = 0..Q-1 cộng dồn total += ans[q], định dạng \"%lld\\n\" qua snprintf() và ghi bằng vòng while(write), đóng close(fd_out) rồi in total ra stdout."
        ],
        "whyThisWay": "Tách bài toán lớn thành 3 khuôn chuẩn quen thuộc giúp mã nguồn vừa dễ viết không lỗi trong phòng thi, vừa đạt hiệu năng tối ưu: đọc toàn bộ tệp 1 lần bằng System Call tuân thủ tuyệt đối quy định cấm fopen/fscanf/fprintf; cấp phát mảng dp[505] cục bộ ngay trên stack của mỗi luồng và phân vùng ghi tách biệt ans[start..end-1] triệt tiêu hoàn toàn Data Race lẫn chi phí khóa mutex; còn nt = min(T, Q) tránh lãng phí luồng khi T > Q.",
        "complexity": "Thời gian: O(S + (∑n_q^2) / min(T, Q)) · Bộ nhớ: O(Q · max(n_q) + S) (bảng giá rod_p[105][505] ≈ 420 KB + mỗi luồng 4 KB mảng dp[505]) · Tài nguyên OS: min(T, Q) luồng POSIX + 2 File Descriptor tuần tự, 0 mutex"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–11",
          "title": "Khai báo thư viện hệ thống & cấu trúc dữ liệu lưu Q bài toán",
          "code": "int Q, T;\nint rod_n[105];\nlong long rod_p[105][505];\nlong long ans[105];",
          "explain": "Nạp đủ 6 thư viện cho System Call tệp (<fcntl.h>, <unistd.h>, <sys/stat.h>), cấp phát động (<stdlib.h>) và đa luồng (<pthread.h>). Với Q ≤ 100 và n_q ≤ 500, khai báo toàn cục rod_n[105] lưu chiều dài thanh gỗ thứ q, rod_p[105][505] lưu bảng giá (đánh chỉ số từ 1..n_q) và ans[105] lưu doanh thu tối đa của từng bộ. Dùng kiểu long long vì doanh thu có thể lên tới 500 × 10^5 = 5 × 10^7 mỗi bài và tổng 100 bài lên tới 5 × 10^9 (vượt int 32-bit!)."
        },
        {
          "lines": "Dòng 13–23",
          "title": "Hàm tự tách số nguyên không âm next_ll() thay thế fscanf()",
          "code": "long long next_ll(const char *s, int *pos, int len) {\n    while (*pos < len && (s[*pos] == ' ' || s[*pos] == '\\n' || s[*pos] == '\\r' || s[*pos] == '\\t')) (*pos)++;\n    long long val = 0;\n    while (*pos < len && s[*pos] >= '0' && s[*pos] <= '9') { val = val * 10 + (s[*pos] - '0'); (*pos)++; }\n    return val;\n}",
          "explain": "Do đề bài đảm bảo Q ≥ 1, n_q ≥ 1 và p_i ≥ 0 (toàn số không âm) đồng thời cấm fscanf(), hàm next_ll() chỉ cần bỏ qua mọi ký tự trắng (' ', '\\n', '\\r', '\\t') rồi ghép liên tiếp các chữ số thập phân từ chuỗi bộ nhớ s và dịch con trỏ *pos."
        },
        {
          "lines": "Dòng 25–30",
          "title": "Phân hoạch tĩnh Q bộ dữ liệu cho nt = min(T, Q) luồng",
          "code": "int tid = *(int *)arg;\nint nt = (T < Q) ? T : Q;\nint base = Q / nt, rem = Q % nt;\nint start = tid * base + (tid < rem ? tid : rem);\nint end = start + base + (tid < rem ? 1 : 0);",
          "explain": "Mỗi luồng nhận chỉ số tid (0..nt-1) và tự tính chính xác khoảng bài toán [start, end) được giao. Nhờ công thức chia phần dư rem = Q % nt, chênh lệch số bài giữa hai luồng bất kỳ tối đa là 1 bài và các đoạn không hề chồng lấn."
        },
        {
          "lines": "Dòng 32–48",
          "title": "Giải song song DP Rod Cutting trên mảng cục bộ dp[505]",
          "code": "long long dp[505];\nfor (int q = start; q < end; q++) {\n    int n = rod_n[q]; dp[0] = 0;\n    for (int j = 1; j <= n; j++) {\n        long long best = 0;\n        for (int i = 1; i <= j; i++) {\n            if (rod_p[q][i] + dp[j - i] > best) best = rod_p[q][i] + dp[j - i];\n        }\n        dp[j] = best;\n    }\n    ans[q] = dp[n];\n}",
          "explain": "CHI TIẾT QUAN TRỌNG: mảng long long dp[505] được khai báo BÊN TRONG hàm worker() nên nằm trên stack riêng của mỗi luồng — tuyệt đối không dùng chung một mảng dp toàn cục (sẽ gây race condition phá hỏng kết quả!). Với mỗi thanh gỗ độ dài n, dp[j] là doanh thu lớn nhất của thanh dài j: ta thử nhát cắt đầu tiên có độ dài i (1 ≤ i ≤ j) bán được rod_p[q][i] cộng doanh thu tối ưu phần còn lại dp[j - i]. Xong bài q, ghi độc quyền vào ans[q] = dp[n] không cần mutex."
        },
        {
          "lines": "Dòng 50–58",
          "title": "Đọc tham số từ stdin & mở tệp nguồn src (lỗi → in -1)",
          "code": "char src[256], dst[256];\nscanf(\"%s %s %d\", src, dst, &T);\nint fd_in = open(src, O_RDONLY);\nif (fd_in < 0) { printf(\"-1\\n\"); return 0; }",
          "explain": "Đọc tên tệp nguồn src, tệp đích dst và số luồng T từ stdin. Mở tệp nguồn bằng system call open(src, O_RDONLY); nếu không mở được (fd_in < 0), lập tức in -1 ra stdout và kết thúc chương trình mà không tạo tệp đích."
        },
        {
          "lines": "Dòng 60–72",
          "title": "Dùng fstat() + malloc() + vòng lặp read() nạp trọn vẹn tệp nguồn",
          "code": "struct stat st; fstat(fd_in, &st);\nint len = (int)st.st_size;\nchar *text = (char *)malloc(len + 1);\nint got = 0;\nwhile (got < len) {\n    ssize_t n = read(fd_in, text + got, len - got);\n    if (n <= 0) break;\n    got += n;\n}\ntext[got] = '\\0'; close(fd_in);",
          "explain": "Lấy tổng kích thước tệp bằng fstat(fd_in, &st), cấp phát đúng len + 1 byte RAM, lặp read() đến khi đọc đủ toàn bộ len byte (chống short read), kết thúc chuỗi bằng '\\0' và đóng ngay fd_in bằng close(fd_in)."
        },
        {
          "lines": "Dòng 74–82",
          "title": "Trích xuất Q bộ bài toán vào bộ nhớ & giải phóng text",
          "code": "int pos = 0;\nQ = (int)next_ll(text, &pos, got);\nfor (int q = 0; q < Q; q++) {\n    rod_n[q] = (int)next_ll(text, &pos, got);\n    for (int i = 1; i <= rod_n[q]; i++) rod_p[q][i] = next_ll(text, &pos, got);\n}\nfree(text);",
          "explain": "Dùng next_ll() đọc tuần tự số lượng bộ Q, sau đó với từng bộ q đọc chiều dài rod_n[q] và n_q mức giá vào rod_p[q][1..n_q] (đánh chỉ số bắt đầu từ 1 khớp công thức cắt độ dài i = 1..j). Giải phóng ngay chuỗi text bằng free(text) trước khi bước vào giai đoạn tính toán đa luồng."
        },
        {
          "lines": "Dòng 84–91",
          "title": "Khởi chạy nt = min(T, Q) luồng & đồng bộ bằng pthread_join()",
          "code": "int nt = (T < Q) ? T : Q;\npthread_t th[16]; int ids[16];\nfor (int i = 0; i < nt; i++) {\n    ids[i] = i;\n    pthread_create(&th[i], NULL, worker, &ids[i]);\n}\nfor (int i = 0; i < nt; i++) pthread_join(th[i], NULL);",
          "explain": "Tính nt = min(T, Q), gán mã định danh vào mảng riêng ids[i] rồi tạo nt luồng chạy worker(). Gọi vòng pthread_join() chờ toàn bộ nt luồng kết thúc để đảm bảo mảng kết quả ans[0..Q-1] đã hoàn thiện 100% trước khi ghi ra tệp."
        },
        {
          "lines": "Dòng 93–110",
          "title": "Ghi Q dòng kết quả ra tệp đích bằng open/write/close & in tổng",
          "code": "int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\nlong long total = 0; char line[64];\nfor (int q = 0; q < Q; q++) {\n    total += ans[q];\n    int l = snprintf(line, sizeof(line), \"%lld\\n\", ans[q]);\n    int off = 0;\n    while (off < l) { ssize_t w = write(fd_out, line + off, l - off); if (w <= 0) break; off += w; }\n}\nclose(fd_out);\nprintf(\"%lld\\n\", total);",
          "explain": "Mở tệp đích với cờ tạo mới/cắt trắng O_WRONLY | O_CREAT | O_TRUNC và quyền 0644. Duyệt từng bộ q = 0..Q-1: cộng dồn ans[q] vào total (kiểu long long chống tràn tổng lớn hơn 2^31 - 1), định dạng thành dòng \"<ans[q]>\\n\" bằng snprintf() rồi ghi trọn vẹn vào fd_out bằng vòng lặp write() chống short write. Cuối cùng đóng tệp bằng close(fd_out) và in tổng doanh thu total ra stdout."
        }
      ],
      "testCases": [
        {
          "name": "Bộ dữ liệu mẫu 2 thanh gỗ",
          "caseDesc": "Q = 2: bộ 1 có n = 4, p = [1, 5, 8, 9] (tối ưu 2+2 = 10); bộ 2 có n = 5, p = [2, 5, 7, 8, 10] (tối ưu 1+2+2 = 12).",
          "howHandled": "Ghi chính xác 2 dòng \"10\\n12\\n\" vào dst_path và in tổng 10 + 12 = 22 ra stdout."
        },
        {
          "name": "Số luồng lớn hơn số bộ dữ liệu (T > Q)",
          "caseDesc": "Q = 2 bộ nhưng T = 8 luồng.",
          "howHandled": "nt = min(8, 2) = 2 nên chỉ tạo đúng 2 luồng, mỗi luồng giải 1 bộ dữ liệu, không có luồng dư thừa."
        },
        {
          "name": "Tệp nguồn không tồn tại",
          "caseDesc": "src_path = missing.txt.",
          "howHandled": "open(src, O_RDONLY) trả về -1 → in \"-1\" ra stdout và thoát ngay, không tạo tệp đích."
        },
        {
          "name": "Stress test biên tối đa (Q = 100, n_q = 500, p_i = 10^5, T = 8)",
          "caseDesc": "100 bài toán lớn nhất chạy trên 8 luồng với tổng doanh thu tới 5 × 10^9.",
          "howHandled": "8 luồng dùng 8 mảng dp[505] riêng biệt trên stack chạy song song O(100 × 500^2 / 8) cực nhanh, kiểu long long chứa trọn tổng > 2^31 - 1 không tràn số."
        }
      ],
      "examRecipe": [
        "Bước 1: Nạp 6 thư viện (<stdio.h>, <stdlib.h>, <fcntl.h>, <unistd.h>, <sys/stat.h>, <pthread.h>) và khai báo mảng toàn cục rod_n[105], rod_p[105][505], ans[105].",
        "Bước 2: Viết khuôn hàm đọc số thủ công next_ll(s, &pos, len) thay cho fscanf() bị cấm.",
        "Bước 3: Trong main(), mở src bằng open(O_RDONLY) (< 0 thì in -1 và thoát), dùng fstat() + malloc(len + 1) + vòng while(read) nạp tệp, tách Q bộ vào rod_n/rod_p rồi free(text).",
        "Bước 4: Viết worker(): tính nt = min(T, Q), chia dải [start, end), khai báo MẢNG CỤC BỘ long long dp[505] trên stack rồi chạy Tabulation Rod Cutting và lưu vào ans[q].",
        "Bước 5: Khởi tạo nt luồng với mảng ids[16], chờ pthread_join() hết cả nt luồng.",
        "Bước 6: Mở dst bằng open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644), lặp ghi từng dòng \"%lld\\n\" bằng snprintf + vòng while(write), cộng dồn total, close(fd_out) rồi in total ra stdout."
      ]
    }
  }
];
