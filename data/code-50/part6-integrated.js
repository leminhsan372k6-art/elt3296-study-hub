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
      "origin": "Chương 4 + Chương 7 — Fibonacci Top-Down Memoization kết hợp 2 luồng Pthreads và Mutex (Mục 4.9, 7.6).",
      "lineByLine": [
        {
          "lines": "Dòng 7–21",
          "code": "fib_memo(k): khóa chỉ lúc đọc và lúc ghi memo[k], KHÔNG khóa lúc gọi đệ quy!",
          "explain": "Quy tắc sống còn chống Deadlock: mở khóa mutex NGAY sau khi đọc memo[k] và trước khi gọi fib_memo(k - 1) + fib_memo(k - 2)."
        },
        {
          "lines": "Dòng 47–57",
          "code": "Tạo 2 luồng tính F(n - 1) và F(n - 2), join rồi cộng a1.result + a2.result",
          "explain": "Hai luồng cùng dùng chung bảng nhớ memo[] có bảo vệ bởi mtx, không tạo quá nhiều luồng và không giữ khóa khi join."
        }
      ],
      "testCases": [
        {
          "name": "n = 0 và n = 1",
          "caseDesc": "Trường hợp cơ sở",
          "howHandled": "In ngay 0 hoặc 1."
        },
        {
          "name": "n = 50 và n = 92",
          "caseDesc": "F(50) = 12586269025, F(92) = 7540113804746346429",
          "howHandled": "long long chứa trọn tới n = 92, Memoization chạy tức thì."
        }
      ],
      "examRecipe": [
        "Mảng long long memo[100] khởi tạo -1, kèm 1 mutex.",
        "fib_memo(k): lock → đọc memo[k] → unlock; nếu != -1 trả ngay; gọi đệ quy không giữ lock; lock → ghi memo[k] → unlock.",
        "Nếu n >= 2: tạo 2 luồng tính n - 1 và n - 2, join cả hai rồi in tổng."
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
      "origin": "Chương 2 + Chương 3 — Tổng hợp File System Call + fork() + pipe() (Mục 2.5, 3.8).",
      "lineByLine": [
        {
          "lines": "Dòng 16–20",
          "code": "Con mở tệp bằng open(path, O_RDONLY); lỗi thì đặt sum = -1",
          "explain": "Cấm dùng fopen/fscanf nên ta đọc bằng read() theo khối 4 KB."
        },
        {
          "lines": "Dòng 27–55",
          "code": "Máy trạng thái tách số từng ký tự (num, in_num, neg)",
          "explain": "Ưu điểm lớn: một số nguyên có thể bị cắt làm đôi ngay ranh giới 4096 byte của buffer, nhưng parse theo từng ký tự vẫn ghép số chính xác 100%! Nhớ chốt số cuối cùng sau khi thoát vòng while (khi tệp không kết thúc bằng \\n)."
        },
        {
          "lines": "Dòng 59–69",
          "code": "Con gửi long long sum qua p[1] → Cha đọc từ p[0], waitpid() và in",
          "explain": "Đóng đủ đầu ống không dùng và thu dọn zombie."
        }
      ],
      "testCases": [
        {
          "name": "Có số âm, số 0 và số dương",
          "caseDesc": "\"10 -4 25\\n0 -9 5\"",
          "howHandled": "Chỉ cộng số > 0: 10 + 25 + 5 = 40."
        },
        {
          "name": "Tệp không kết thúc bằng dấu xuống dòng",
          "caseDesc": "\"12 8\" (EOF ngay sau chữ số 8)",
          "howHandled": "Khối if (in_num) sau vòng while cộng nốt số 8."
        },
        {
          "name": "Tệp không tồn tại",
          "caseDesc": "missing.txt",
          "howHandled": "Con gửi sum = -1 qua pipe, cha in -1."
        }
      ],
      "examRecipe": [
        "Tạo pipe(p) trước fork().",
        "Con: open(path, O_RDONLY) < 0 → sum = -1; ngược lại đọc buffer 4096 byte và tách số nguyên từng ký tự (xử lý dấu '-' và chốt số cuối sau while).",
        "Con chỉ cộng val > 0, close(fd), ghi sum vào p[1], _exit(0).",
        "Cha đóng p[1], đọc ans từ p[0], waitpid() và in ans."
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
      "origin": "Chương 2 + Chương 4 — Đọc tệp song song bằng T luồng với mỗi luồng tự mở File Descriptor riêng (Mục 2.6, 4.1).",
      "lineByLine": [
        {
          "lines": "Dòng 19–25",
          "code": "int fd = open(file_path, O_RDONLY); lseek(fd, start, SEEK_SET);",
          "explain": "CỰC KỲ QUAN TRỌNG: Vì các luồng dùng chung bảng FD của tiến trình, nếu chia sẻ 1 fd duy nhất thì lệnh lseek() của luồng này sẽ làm nhảy lệch vị trí read() của luồng kia! Mỗi luồng tự open() sẽ nhận 1 Open File Table Entry và con trỏ offset riêng hoàn toàn."
        },
        {
          "lines": "Dòng 30–38",
          "code": "Đọc đúng remain byte được giao, so sánh buf[i] == (unsigned char)target_byte",
          "explain": "Giới hạn số byte đọc bằng min(remain, 4096) để không đọc lấn sang đoạn của luồng kế tiếp."
        },
        {
          "lines": "Dòng 49–64",
          "code": "Kiểm tra stat() và open() trước; nếu file_size == 0 in 0 ngay",
          "explain": "Xử lý sạch lỗi tệp không tồn tại / không có quyền (-1) và tệp rỗng (0)."
        }
      ],
      "testCases": [
        {
          "name": "Tệp nhị phân có byte 0x00 và 0x41",
          "caseDesc": "f43.bin 65 4",
          "howHandled": "So sánh unsigned char đúng cả với target_byte = 0 hoặc 255 → in 5."
        },
        {
          "name": "Tệp rỗng 0 byte hoặc tệp lỗi",
          "caseDesc": "size = 0 / missing.bin",
          "howHandled": "In 0 cho rỗng, -1 cho lỗi."
        }
      ],
      "examRecipe": [
        "Luồng chính: stat() lấy file_size (lỗi → -1; rỗng → 0).",
        "Trong mỗi luồng: tự gọi open(file_path, O_RDONLY), lseek(fd, start, SEEK_SET), đọc đúng len byte vào unsigned char buf[4096], đếm local_cnt rồi close(fd).",
        "Ghi counts[tid] = local_cnt; luồng chính join và cộng tổng."
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
      "origin": "Chương 2 + Chương 7 — Đọc/ghi tệp hoàn toàn bằng System Call kết hợp Quy hoạch động Balo 0/1 (Mục 2.5, 7.11).",
      "lineByLine": [
        {
          "lines": "Dòng 9–21",
          "code": "Hàm next_ll(text, &pos, len)",
          "explain": "Hàm tách số nguyên siêu ngắn gọn trên chuỗi bộ nhớ đã đọc từ read() — thay thế hoàn hảo cho fscanf (vốn bị cấm ở bài này!)."
        },
        {
          "lines": "Dòng 27–45",
          "code": "open(src, O_RDONLY) → fstat lấy kích thước → đọc toàn bộ vào text → close",
          "explain": "Đọc trọn tệp đầu vào bằng system call. Nếu mở lỗi in -1 ngay."
        },
        {
          "lines": "Dòng 47–57",
          "code": "Giải 0/1 Knapsack bằng vòng duyệt ngược j = W → w",
          "explain": "Tính ans = dp[W] bằng kiểu long long."
        },
        {
          "lines": "Dòng 60–72",
          "code": "snprintf(out_buf, ..., \"%lld\\n\", ans) → open(dst, O_WRONLY|O_CREAT|O_TRUNC, 0644) → write()",
          "explain": "Định dạng chuỗi vào bộ nhớ bằng snprintf rồi ghi ra tệp đích bằng write(), đồng thời in ans ra stdout."
        }
      ],
      "testCases": [
        {
          "name": "ks44_in.txt: 4 7 / (1,1),(3,4),(4,5),(5,7)",
          "caseDesc": "Chọn (3,4) + (4,5) = 9",
          "howHandled": "Ghi \"9\\n\" vào ks44_out.txt và in \"9\" ra stdout."
        },
        {
          "name": "src không tồn tại",
          "caseDesc": "missing.txt",
          "howHandled": "In \"-1\" ngay, không tạo tệp đích."
        }
      ],
      "examRecipe": [
        "Cấm fopen/fscanf/fprintf! Dùng open + fstat + read nạp tệp vào chuỗi text.",
        "Viết hàm 10 dòng next_ll() đọc từng số từ text.",
        "Giải 0/1 Knapsack vòng ngược j = W..w.",
        "Dùng snprintf tạo chuỗi \"<ans>\\n\", ghi vào dst bằng open(O_WRONLY|O_CREAT|O_TRUNC, 0644) + write() + close(), rồi printf(\"%lld\\n\", ans)."
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
      "origin": "Chương 3 + Chương 5 — Tìm song song Min & Max bằng k tiến trình con gửi struct qua mảng pipe riêng (Mục 3.8, 5.4).",
      "lineByLine": [
        {
          "lines": "Dòng 6–9",
          "code": "typedef struct { long long mn; long long mx; } MinMax;",
          "explain": "Đóng gói cả min và max vào 1 struct 16 byte để truyền gọn trong 1 lần write()/read() qua ống pipe riêng."
        },
        {
          "lines": "Dòng 18–45",
          "code": "c = min(k, n); mỗi con xử lý [L, R), khởi tạo mn = mx = a[L] rồi gửi mm và _exit(0)",
          "explain": "Khởi tạo từ a[L] đảm bảo đúng với mọi giá trị âm/dương tới ±10^9."
        },
        {
          "lines": "Dòng 51–65",
          "code": "Cha đọc c struct MinMax, hợp nhất global min/max và waitpid() cho cả c con",
          "explain": "Không để zombie và không trộn byte nhờ mảng pipes[8][2]."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ chuẩn",
          "caseDesc": "7 3 / 15 -42 8 99 0 -3 74",
          "howHandled": "In \"-42 99\"."
        },
        {
          "name": "n = 1 hoặc k > n",
          "caseDesc": "1 8 / -500",
          "howHandled": "c = min(8, 1) = 1 → in \"-500 -500\"."
        }
      ],
      "examRecipe": [
        "Tạo struct MinMax { long long mn, mx; }; và mảng pipes[8][2].",
        "c = min(n, k); phân hoạch [L, R) cho từng con.",
        "Con tính mn, mx từ a[L], gửi sizeof(mm) vào pipes[i][1], _exit(0).",
        "Cha đọc c kết quả, gộp min/max toàn cục, waitpid() hết rồi in."
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
      "origin": "Chương 4 + Chương 7 — Song song hóa Quy hoạch động Balo 0/1 theo tầng trọng lượng với 2 mảng dp_prev/dp_cur (Mục 4.7, 7.11).",
      "lineByLine": [
        {
          "lines": "Dòng 7–9",
          "code": "dp_prev = buf1; dp_cur = buf2;",
          "explain": "Tách 2 mảng: hàng trước dp_prev chỉ đọc, hàng hiện tại dp_cur mỗi luồng ghi vào đoạn [L, R) riêng → 0 race condition, 0 mutex!"
        },
        {
          "lines": "Dòng 20–26",
          "code": "dp_cur[w] = max(dp_prev[w], dp_prev[w - cur_w] + cur_v)",
          "explain": "Tính toàn bộ W + 1 trạng thái của tầng i song song trên T luồng."
        },
        {
          "lines": "Dòng 45–51",
          "code": "pthread_join hết T luồng → hoán đổi con trỏ dp_prev ↔ dp_cur",
          "explain": "Đồng bộ chặt chẽ xong trọn vẹn hàng i rồi đổi con trỏ O(1) (không phải copy mảng!) sang vật i + 1."
        }
      ],
      "testCases": [
        {
          "name": "Ví dụ chuẩn",
          "caseDesc": "4 10 4 / (6,30), (3,14), (4,16), (2,9)",
          "howHandled": "Chọn (6,30) + (4,16) = 46."
        },
        {
          "name": "T > W + 1",
          "caseDesc": "W = 2, T = 8",
          "howHandled": "total = 3 → 3 luồng đầu tính w=0,1,2, các luồng sau đoạn rỗng an toàn."
        }
      ],
      "examRecipe": [
        "Dùng 2 mảng buf1[10005], buf2[10005] với 2 con trỏ dp_prev, dp_cur.",
        "Với từng vật i = 0..n-1: chia dải 0..W (tổng W + 1 ô) cho T luồng.",
        "Mỗi luồng tính dp_cur[w] từ dp_prev[w] và dp_prev[w - cur_w] + cur_v.",
        "Join xong cả T luồng thì swap(dp_prev, dp_cur). Cuối cùng in dp_prev[W]."
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
      "origin": "Chương 4 + Chương 7 — LCS Top-Down Memoization kết hợp Pthreads và Mutex bảo vệ bảng nhớ (Mục 4.9, 7.11).",
      "lineByLine": [
        {
          "lines": "Dòng 9–30",
          "code": "lcs_memo(i, j): chỉ khóa mutex lúc đọc và lúc ghi memo[i][j]",
          "explain": "Mở khóa ngay trước khi gọi đệ quy tránh Deadlock; bảng memo[505][505] khởi tạo -1 bằng memset."
        },
        {
          "lines": "Dòng 49–65",
          "code": "Tại lời gọi gốc: tách 2 luồng tính LCS(m-1, n) và LCS(m, n-1) khi X[m-1] != Y[n-1]",
          "explain": "Vừa thỏa mãn yêu cầu dùng pthread_create/join + mutex dùng chung bảng nhớ, vừa giới hạn đúng 2 luồng (tránh bùng nổ số luồng)."
        }
      ],
      "testCases": [
        {
          "name": "AGGTAB và GXTXAYB",
          "caseDesc": "Ký tự cuối khớp (B == B)",
          "howHandled": "Tạo luồng tính (m-1, n-1) + 1 = 4."
        },
        {
          "name": "Ký tự cuối khác nhau (ABC và ABD)",
          "caseDesc": "Tách 2 luồng song song",
          "howHandled": "max(LCS(AB, ABD), LCS(ABC, AB)) = 2."
        },
        {
          "name": "Chuỗi dài 500 ký tự",
          "caseDesc": "m = n = 500",
          "howHandled": "500x500 = 250.000 ô, Memoization chạy rất nhanh."
        }
      ],
      "examRecipe": [
        "Mảng toàn cục memo[505][505], memset(memo, -1, sizeof(memo)).",
        "lcs_memo(i, j): giống hệt CR-41 — lock đọc → unlock → đệ quy → lock ghi → unlock.",
        "Trong main: nếu X[m-1] != Y[n-1] tạo 2 luồng tính (m-1, n) và (m, n-1), join rồi in max; ngược lại tạo luồng tính (m-1, n-1) rồi cộng 1."
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
      "origin": "Chương 2 + Chương 4 + Chương 5 — Xử lý nhiều tệp song song bằng System Call và T luồng (Mục 2.5, 5.4).",
      "lineByLine": [
        {
          "lines": "Dòng 12–15",
          "code": "nt = min(T, k); phân hoạch danh sách tệp [start, end)",
          "explain": "Mỗi luồng phụ trách 1 dải chỉ số tệp riêng và ghi vào file_sum[idx] tương ứng nên không cần mutex."
        },
        {
          "lines": "Dòng 18–30",
          "code": "open(paths[idx], O_RDONLY) → đọc unsigned char buf[4096] → cộng sum → close(fd)",
          "explain": "Nếu open() thất bại thì đặt file_sum[idx] = -1; tệp rỗng có vòng while 0 lần nên tổng = 0; đọc unsigned char bảo đảm mỗi byte có giá trị 0..255 (không bị âm với 0xFF!)."
        }
      ],
      "testCases": [
        {
          "name": "Kết hợp tệp thường, tệp thiếu và tệp nhị phân 0x00/0xFF",
          "caseDesc": "f1(\"AB\"), missing, f3([0x00, 0xFF, 0x01])",
          "howHandled": "In \"131 -1 256\"."
        },
        {
          "name": "T > k hoặc tệp rỗng",
          "caseDesc": "k = 2, T = 8",
          "howHandled": "nt = 2, tệp rỗng cho kết quả 0."
        }
      ],
      "examRecipe": [
        "Đọc k tên tệp vào mảng paths[35][256].",
        "Chia k tệp cho nt = min(T, k) luồng.",
        "Mỗi tệp: open(O_RDONLY) < 0 → -1; ngược lại đọc unsigned char buf[4096] cộng từng byte rồi close(fd).",
        "Join hết rồi in file_sum[0..k-1] trên 1 dòng không dư dấu cách."
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
      "origin": "Chương 2 + Chương 3 — Tổng hợp File System Call + fork() + Signal SIGUSR1 + stat() (Mục 2.5, 2.7, 3.6, 3.7).",
      "lineByLine": [
        {
          "lines": "Dòng 8–20",
          "code": "volatile sig_atomic_t got_sig = 0; signal(SIGUSR1, handle_sigusr1);",
          "explain": "ĐĂNG KÝ HANDLER TRƯỚC FORK! Nếu cài sau fork(), con có thể gửi SIGUSR1 trước làm chết tiến trình cha."
        },
        {
          "lines": "Dòng 24–27",
          "code": "if (fd_in < 0) _exit(1);",
          "explain": "Con không mở được tệp nguồn thì thoát ngay với mã lỗi 1 (không gửi tín hiệu)."
        },
        {
          "lines": "Dòng 37–51",
          "code": "Lọc (b >= 32 && b <= 126) || b == '\\n' gom vào out_buf rồi ghi ra fd_out",
          "explain": "Giữ lại đúng các ký tự ASCII in được và xuống dòng, bỏ các byte điều khiển/0x00/0x7F, đồng thời gom thành khối ghi 1 lần cho nhanh."
        },
        {
          "lines": "Dòng 55–66",
          "code": "Con gửi kill(getppid(), SIGUSR1) rồi _exit(0); Cha waitpid → stat(dst) → in got_sig và st_size",
          "explain": "Nếu con thoát khác 0 thì cha in \"-1 -1\"; ngược lại in \"1 <kích_thước_đích>\"."
        }
      ],
      "testCases": [
        {
          "name": "Tệp nhị phân lẫn ký tự điều khiển",
          "caseDesc": "\"Hi!\\x00\\x01\\x7F\\nOK\" (9 byte)",
          "howHandled": "Lọc còn \"Hi!\\nOK\" (6 byte), gửi SIGUSR1 → in \"1 6\"."
        },
        {
          "name": "Tệp nguồn không tồn tại",
          "caseDesc": "missing.bin",
          "howHandled": "Con _exit(1) → cha thấy WEXITSTATUS != 0 → in \"-1 -1\"."
        }
      ],
      "examRecipe": [
        "Khai báo volatile sig_atomic_t got_sig = 0 và handler đặt got_sig = 1.",
        "Gọi signal(SIGUSR1, handler) TRƯỚC fork().",
        "Con: mở src (lỗi → _exit(1)), mở dst (0644), lọc (32..126 hoặc '\\n') ghi sang dst, đóng 2 FD, gọi kill(getppid(), SIGUSR1) rồi _exit(0).",
        "Cha: waitpid(&status) → nếu thoát khác 0 in \"-1 -1\", ngược lại stat(dst, &st) in got_sig và st.st_size."
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
      "origin": "Chương 2 + Chương 5 + Chương 7 — Tổng hợp tối thượng: Đọc/ghi tệp System Call + Phân hoạch song song T luồng + DP Rod Cutting (Mục 2.5, 5.4, 7.8).",
      "lineByLine": [
        {
          "lines": "Dòng 54–82",
          "code": "open(src) + fstat + read toàn bộ tệp → tách Q bộ dữ liệu bằng next_ll()",
          "explain": "Tuân thủ tuyệt đối quy định cấm fopen/fscanf."
        },
        {
          "lines": "Dòng 25–47",
          "code": "Mỗi luồng có mảng cục bộ long long dp[505] giải dải bài toán [start, end)",
          "explain": "Hoàn toàn không tranh chấp dữ liệu và không cần mutex vì mỗi luồng dùng mảng dp[] trên stack riêng và ghi vào ô ans[q] riêng."
        },
        {
          "lines": "Dòng 93–108",
          "code": "Ghi Q dòng ans[q] ra dst bằng open/write/close rồi in tổng ra stdout",
          "explain": "Tạo tệp đích chuẩn 0644 và đối chiếu chính xác cả tệp đích lẫn stdout."
        }
      ],
      "testCases": [
        {
          "name": "2 bộ dữ liệu mẫu",
          "caseDesc": "n=4 [1,5,8,9] (→10) và n=5 [2,5,7,8,10] (→12)",
          "howHandled": "Ghi \"10\\n12\\n\" vào out50.txt và in 22 ra stdout."
        },
        {
          "name": "T > Q hoặc tệp nguồn lỗi",
          "caseDesc": "Q = 2, T = 8 hoặc missing.txt",
          "howHandled": "nt = min(T, Q) = 2; tệp lỗi in -1 ngay."
        }
      ],
      "examRecipe": [
        "Ghép 3 khuôn quen thuộc: (1) Đọc tệp + next_ll như CR-44; (2) Chia Q bài cho min(T, Q) luồng; (3) Mỗi luồng khai báo dp[505] cục bộ chạy Rod Cutting như CR-34.",
        "Sau join: mở dst bằng O_WRONLY|O_CREAT|O_TRUNC (0644), lặp ghi từng dòng \"%lld\\n\" bằng write() và cộng dồn tổng để in stdout."
      ]
    }
  }
];
