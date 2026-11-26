export const PART2_PROCESS_QUESTIONS = [
  {
    "num": 9,
    "id": "CR-09",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Dễ",
    "title": "Tạo tiến trình con bằng fork() và nhận kết quả qua waitpid()",
    "staticSummary": "Kiểm tra tĩnh fork, waitpid/wait, WIFEXITED, WEXITSTATUS",
    "prompt": "Cho hai số nguyên không âm a và b (a <= b). Tiến trình cha gọi fork() tạo một tiến trình con. Tiến trình con thực hiện tính tổng các số nguyên từ a đến b theo modulo 200 rồi kết thúc bằng exit() hoặc _exit() với mã thoát chính là phần dư vừa tính. Tiến trình cha chờ con hoàn tất bằng waitpid() (hoặc wait()), trích xuất mã thoát của con bằng WIFEXITED và WEXITSTATUS rồi in ra stdout.",
    "requirements": [
      "Sử dụng <unistd.h>, <sys/wait.h>, <stdlib.h>.",
      "Bắt buộc gọi fork() để giao việc tính tổng cho tiến trình con, và gọi waitpid() / wait() ở tiến trình cha.",
      "Sử dụng macro WIFEXITED(status) và WEXITSTATUS(status) để lấy giá trị trả về (modulo 200 đảm bảo không vượt giới hạn 8-bit [0..255] của exit code).",
      "Tiến trình con không in bất kỳ nội dung gì ra stdout."
    ],
    "inputSpec": "Một dòng chứa hai số nguyên a và b.",
    "outputSpec": "Một số nguyên duy nhất là (tổng từ a đến b) % 200.",
    "constraints": [
      "0 <= a <= b <= 10^6"
    ],
    "example": {
      "note": "Tổng từ 1 đến 25 là 325; 325 % 200 = 125.",
      "input": "1 25",
      "output": "125"
    },
    "relatedTopics": [
      {
        "id": "3-3",
        "label": "3.3 Tạo tiến trình con với fork()"
      },
      {
        "id": "3-5",
        "label": "3.5 Kết thúc tiến trình, 8-bit Exit Status & Zombie"
      },
      {
        "id": "3-6",
        "label": "3.6 Thu gom tiến trình con bằng waitpid(), WIFEXITED, WEXITSTATUS"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Kernel Linux chỉ giữ đúng 8 bit thấp (0..255) của mã thoát truyền vào _exit(status). Đó chính là lý do đề bài lấy modulo 200 để giá trị truyền qua WEXITSTATUS không bị cắt mất bit cao.",
    "relatedQuestions": [
      "CR-11",
      "CR-16"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    long long a, b;\n    scanf(\"%lld %lld\", &a, &b);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        long long sum = 0;\n        for (long long i = a; i <= b; i++) {\n            sum = (sum + i) % 200;\n        }\n        _exit((int)sum);\n    } else {\n        int status;\n        waitpid(pid, &status, 0);\n        if (WIFEXITED(status)) {\n            printf(\"%d\\n\", WEXITSTATUS(status));\n        }\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Gọi fflush(stdout) trước fork() và dùng _exit() trong tiến trình con để tránh nhân đôi bộ đệm xuất chuẩn stdio.",
      "Macro WIFEXITED(status) xác nhận tiến trình con kết thúc bình thường trước khi dùng WEXITSTATUS(status) rút 8 bit mã thoát."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "fork",
        "WIFEXITED",
        "WEXITSTATUS"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Thu gom tiến trình con bằng waitpid() hoặc wait()",
          "regex": "\\bwait(pid)?\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Chia lấy dư 200 tránh tràn 8-bit exit status",
          "regex": "%\\s*200",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 — Lập trình tiến trình trên Linux: Tạo tiến trình con với fork(), cơ chế mã thoát 8-bit của _exit() và thu gom bằng waitpid() (Mục 3.3, 3.5, 3.6 · Lab 3 Bài 1, 3).",
      "idea": {
        "summary": "Đề bài yêu cầu tính tổng các số nguyên từ a đến b theo modulo 200, nhưng không tính ở tiến trình chính mà phải tạo một tiến trình con bằng fork() để làm việc đó. Thay vì mở pipe, tiến trình con gửi kết quả (nằm trong đoạn 0..199) về cho cha thông qua chính mã thoát (exit status) của _exit(), còn tiến trình cha dùng waitpid() đợi con kết thúc rồi giải mã lấy kết quả in ra.",
        "steps": [
          "Bước 1 — Đọc đầu vào trước fork(): Tiến trình cha đọc hai số a và b (kiểu long long) từ stdin. Khi gọi fork() sau đó, tiến trình con tự động kế thừa bản sao giá trị của a và b.",
          "Bước 2 — Nhân bản tiến trình: Gọi pid_t pid = fork(). Từ sau dòng này có 2 tiến trình chạy song song: ở tiến trình con pid == 0, ở tiến trình cha pid > 0 (là PID của con).",
          "Bước 3 — Tiến trình con tính toán & trả kết quả: Trong nhánh pid == 0, con cộng dồn i từ a đến b, lấy % 200 ngay ở mỗi bước để không tràn số, rồi kết thúc ngay bằng _exit((int)sum) mà không in gì ra stdout.",
          "Bước 4 — Tiến trình cha chờ và thu gom con: Trong nhánh else, cha gọi waitpid(pid, &status, 0) để chặn chờ con chạy xong và dọn bản ghi tiến trình con khỏi bảng tiến trình nhân (tránh Zombie).",
          "Bước 5 — Giải mã status và in kết quả: Cha kiểm tra WIFEXITED(status) để chắc chắn con thoát bình thường, sau đó trích xuất đúng 8 bit mã thoát bằng WEXITSTATUS(status) và in ra stdout."
        ],
        "whyThisWay": "Nhân Linux chỉ lưu đúng 8 bit thấp (giá trị 0..255) của mã thoát truyền vào _exit(code) bên trong biến nguyên status, vì vậy phép lấy dư % 200 ngay trong vòng lặp vừa tránh tràn kiểu int khi b = 10^6 (tổng thực ~5×10^11) vừa đảm bảo kết quả luôn lọt gọn vào khoảng 0..199 không bị cắt bit. Dùng _exit() thay cho exit() trong con giúp thoát thẳng ở mức nhân mà không xả (flush) nhầm bộ đệm stdio kế thừa từ cha, còn gọi waitpid() giúp giải phóng hoàn toàn tiến trình Zombie.",
        "complexity": "Thời gian: O(b − a + 1) · Bộ nhớ: O(1) · Tài nguyên HĐH: 1 tiến trình con (được thu gom sạch qua waitpid)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện chuẩn và thư viện hệ thống POSIX",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "<stdio.h> cung cấp scanf() và printf(). <stdlib.h> là thư viện chuẩn cho exit() và tiện ích tổng quát (đề bài yêu cầu khai báo). <unistd.h> là thư viện cốt lõi của POSIX Linux chứa khai báo pid_t, fork() và _exit(). <sys/wait.h> cung cấp hàm waitpid() cùng các macro giải mã trạng thái kết thúc như WIFEXITED và WEXITSTATUS."
        },
        {
          "lines": "Dòng 6–8",
          "title": "Nhập khoảng [a, b] kiểu long long trước khi tách tiến trình",
          "code": "long long a, b;\nscanf(\"%lld %lld\", &a, &b);",
          "explain": "Khai báo a, b kiểu long long (64-bit, định dạng \"%lld\") giúp mọi phép cộng với i sau này đều an toàn tuyệt đối, không lo tràn số dù b tới 10^6. Đọc input trước khi gọi fork() là thói quen cực kỳ quan trọng: tiến trình con sinh ra sẽ tự động có sẵn bản sao của a và b trong vùng nhớ riêng của nó, tránh tình trạng cả cha và con cùng tranh đọc stdin."
        },
        {
          "lines": "Dòng 10–11",
          "title": "Gọi fork() tạo tiến trình con và rẽ nhánh Cha / Con",
          "code": "pid_t pid = fork();\nif (pid == 0) {",
          "explain": "Lời gọi hệ thống fork() được gọi 1 lần nhưng trả về 2 lần trên 2 tiến trình độc lập: trả về 0 bên trong tiến trình con, trả về PID dương của con bên trong tiến trình cha (hoặc -1 nếu hệ thống hết tài nguyên không tạo được). Kiểu pid_t là kiểu số nguyên có dấu chuẩn POSIX đại diện cho mã định danh tiến trình. Nhờ câu lệnh if (pid == 0), ta tách bạch hoàn toàn công việc của con và cha."
        },
        {
          "lines": "Dòng 12–16",
          "title": "Nhánh con: tính tổng modulo 200 và thoát bằng _exit()",
          "code": "long long sum = 0;\nfor (long long i = a; i <= b; i++) {\n    sum = (sum + i) % 200;\n}\n_exit((int)sum);",
          "explain": "Áp dụng tính chất đồng dư (A + B) % 200 = ((A % 200) + B) % 200, ta lấy % 200 ở mỗi vòng lặp nên sum luôn nằm trong [0..199] — không bao giờ tràn số và chắc chắn vừa khít 8 bit không dấu [0..255] của exit code. Lệnh _exit((int)sum) kết thúc tiến trình con ngay lập tức tại tầng nhân và gửi giá trị sum làm mã thoát. Nếu quên _exit() hoặc dùng exit() sau khi cha đã in gì đó chưa flush, bộ đệm stdout có thể bị in trùng hai lần; đồng thời con không được in gì ra stdout theo đúng yêu cầu đề bài."
        },
        {
          "lines": "Dòng 17–25",
          "title": "Nhánh cha: chờ con bằng waitpid(), giải mã status và in kết quả",
          "code": "int status;\nwaitpid(pid, &status, 0);\nif (WIFEXITED(status)) {\n    printf(\"%d\\n\", WEXITSTATUS(status));\n}",
          "explain": "waitpid(pid, &status, 0) chặn (block) tiến trình cha cho tới khi đúng tiến trình con có mã pid kết thúc; tham số thứ 3 bằng 0 nghĩa là chờ đồng bộ bình thường. Nhân Linux đóng gói nhiều thông tin vào biến status ở dạng các trường bit (không phải là số nguyên mã thoát thuần túy!). Do đó bắt buộc kiểm tra WIFEXITED(status) (trả về khác 0 nếu con thoát bình thường bằng exit/_exit/return) trước khi gọi WEXITSTATUS(status) để dịch và lấy đúng 8 bit cao chứa mã thoát (0..255). Nếu in trực tiếp status thay vì WEXITSTATUS(status), kết quả 125 sẽ bị in sai thành 32000 (125 << 8)! Cuối cùng return 0 kết thúc chương trình."
        }
      ],
      "testCases": [
        {
          "name": "Trường hợp chuẩn (1 đến 25)",
          "caseDesc": "Input: \"1 25\". Tổng thực = 25 × 26 / 2 = 325; 325 % 200 = 125.",
          "howHandled": "Con tính sum = 125 rồi gọi _exit(125). Cha nhận qua waitpid(), WIFEXITED(status) đúng, WEXITSTATUS(status) trả 125 và in \"125\"."
        },
        {
          "name": "Biên nhỏ nhất (a == b == 0)",
          "caseDesc": "Input: \"0 0\". Khoảng chỉ gồm đúng 1 phần tử 0.",
          "howHandled": "Vòng lặp chạy 1 lần với i = 0 → sum = 0 → _exit(0). Cha thu được WEXITSTATUS(status) = 0 và in \"0\"."
        },
        {
          "name": "Tổng chia hết đúng cho 200 (biên đồng dư)",
          "caseDesc": "Input: \"200 200\" hoặc \"1 399\" (tổng = 79800, chia hết cho 200).",
          "howHandled": "sum quay vòng về 0 sau phép % 200, _exit(0) trả mã thoát 0 hợp lệ, cha in \"0\" (không bị nhầm thành 200)."
        },
        {
          "name": "Khoảng lớn nhất 0..10^6 (bẫy tràn 32-bit và tràn 8-bit)",
          "caseDesc": "Input: \"0 1000000\". Tổng thực = 500000500000 (~5×10^11), vượt xa kiểu int 32-bit (~2.14×10^9) và giới hạn 8-bit (255).",
          "howHandled": "Biến i, sum dùng long long và lấy % 200 ở từng bước lặp nên không bao giờ tràn số; tổng % 200 = 0 được truyền nguyên vẹn qua _exit(0)."
        }
      ],
      "examRecipe": [
        "Khai báo đủ 4 header: <stdio.h>, <stdlib.h>, <unistd.h>, <sys/wait.h>.",
        "Đọc a, b bằng scanf(\"%lld %lld\", &a, &b) TRƯỚC khi gọi fork().",
        "Gọi pid_t pid = fork(); và mở cấu trúc if (pid == 0) { ... } else { ... }.",
        "Trong nhánh con: cộng dồn sum = (sum + i) % 200 từ a đến b rồi thoát ngay bằng _exit((int)sum) (tuyệt đối không in gì).",
        "Trong nhánh cha: khai báo int status; gọi waitpid(pid, &status, 0); kiểm tra if (WIFEXITED(status)) rồi in WEXITSTATUS(status)."
      ]
    }
  },
  {
    "num": 10,
    "id": "CR-10",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Dễ",
    "title": "Truyền dãy số từ tiến trình cha sang tiến trình con qua pipe()",
    "staticSummary": "Kiểm tra tĩnh fork, pipe, waitpid/wait",
    "prompt": "Tiến trình cha đọc số nguyên n và dãy n số nguyên từ stdin, tạo một đường ống ẩn danh bằng pipe() và sinh một tiến trình con bằng fork(). Tiến trình cha gửi dữ liệu qua đầu ghi của ống cho tiến trình con rồi đóng đầu ghi và đợi con kết thúc. Tiến trình con đọc dãy số từ đầu đọc của ống, tính tổng tất cả n số rồi in tổng ra stdout.",
    "requirements": [
      "Sử dụng <unistd.h> và <sys/wait.h>.",
      "Bắt buộc dùng pipe(), fork(), read(), write(), close(), waitpid() (hoặc wait()).",
      "Đóng đầy đủ các đầu ống không dùng: cha đóng p[0] trước khi ghi và đóng p[1] sau khi ghi xong; con đóng p[1] trước khi đọc.",
      "Không dùng biến toàn cục chia sẻ trước fork thay cho giao tiếp qua pipe."
    ],
    "inputSpec": "Dòng 1: số nguyên n. Dòng 2: n số nguyên a_1, a_2, ..., a_n.",
    "outputSpec": "Một số nguyên (long long) là tổng của n số đã cho.",
    "constraints": [
      "1 <= n <= 10^4",
      "-10^6 <= a_i <= 10^6"
    ],
    "example": {
      "note": "Cha gửi 5 phần tử qua pipe; con đọc cho tới EOF và in 34.",
      "input": "5\n10 -3 7 8 12",
      "output": "34"
    },
    "relatedTopics": [
      {
        "id": "3-3",
        "label": "3.3 Tách không gian địa chỉ sau fork()"
      },
      {
        "id": "3-8",
        "label": "3.8 Giao tiếp liên tiến trình bằng pipe() & quy tắc đóng đầu ống"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Đường ống ẩn danh pipe(p) tạo p[0] để đọc và p[1] để ghi. Đầu đọc p[0] chỉ nhận được EOF (read trả về 0) khi TẤT CẢ các File Descriptor trỏ vào p[1] (ở cả con lẫn cha) đều đã được close()!",
    "relatedQuestions": [
      "CR-11",
      "CR-12",
      "CR-15",
      "CR-42"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    int *a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    int p[2];\n    pipe(p);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        close(p[1]);\n        long long sum = 0;\n        int x;\n        for (int i = 0; i < n; i++) {\n            read(p[0], &x, sizeof(x));\n            sum += x;\n        }\n        close(p[0]);\n        printf(\"%lld\\n\", sum);\n        fflush(stdout);\n        free(a);\n        _exit(0);\n    } else {\n        close(p[0]);\n        for (int i = 0; i < n; i++) {\n            write(p[1], &a[i], sizeof(a[i]));\n        }\n        close(p[1]);\n        waitpid(pid, NULL, 0);\n        free(a);\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Gọi fork() TRƯỚC khi cha đọc dãy a_i từ stdin để chứng minh tuyệt đối dữ liệu ở tiến trình con chỉ có thể nhận qua đường ống p[0] chứ không phải thừa kế bộ nhớ trước fork.",
      "Con đóng p[1] ngay đầu nhánh pid == 0; cha đóng p[1] ngay sau khi gửi hết n số nguyên để đánh thức con thoát vòng đọc với EOF."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "pipe",
        "fork",
        "read",
        "write",
        "close"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Thu gom tiến trình con bằng waitpid() hoặc wait()",
          "regex": "\\bwait(pid)?\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Đóng đầu ghi p[1] để báo hiệu kết thúc luồng dữ liệu (EOF)",
          "regex": "close\\s*\\(\\s*\\w+\\s*\\[\\s*1\\s*\\]\\s*\\)",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 — Giao tiếp liên tiến trình (IPC) một chiều giữa Cha và Con qua đường ống ẩn danh pipe() (Mục 3.8 · Slide APT03).",
      "idea": {
        "summary": "Đề bài yêu cầu tiến trình cha đọc dãy n số nguyên từ bàn phím rồi truyền toàn bộ dãy đó sang cho tiến trình con qua một đường ống ẩn danh pipe(). Tiến trình con đọc từng số từ ống, tính tổng kiểu long long rồi tự in kết quả ra màn hình; tiến trình cha đợi con xong mới kết thúc.",
        "steps": [
          "Bước 1 — Cha nhập dữ liệu: Tiến trình cha đọc n, cấp phát động mảng a gồm n phần tử bằng malloc() và đọc đủ n số từ stdin.",
          "Bước 2 — Khởi tạo ống TRƯỚC fork(): Gọi pipe(p) để nhân Linux tạo một bộ đệm vòng một chiều với 2 File Descriptor: p[0] (đầu đọc) và p[1] (đầu ghi).",
          "Bước 3 — Tách tiến trình bằng fork(): Cả cha và con đều kế thừa đồng thời cả p[0] và p[1] trỏ tới cùng một ống trong nhân.",
          "Bước 4 — Đóng đầu ống thừa và truyền/nhận dữ liệu: Cha đóng p[0], ghi từng phần tử a[i] vào p[1] rồi đóng p[1] để báo hết dữ liệu (EOF). Con đóng p[1], đọc đủ n số nguyên từ p[0] cộng dồn vào biến sum kiểu long long rồi đóng p[0].",
          "Bước 5 — Con in kết quả & xả đệm, Cha thu gom: Con in sum, gọi fflush(stdout) trước khi _exit(0) để tránh mất output trong bộ đệm; cha gọi waitpid() đợi con kết thúc rồi giải phóng mảng a."
        ],
        "whyThisWay": "pipe(p) bắt buộc gọi TRƯỚC fork() để hai tiến trình dùng chung một đối tượng ống trong nhân (gọi sau fork() sẽ tạo ra 2 ống rời nhau hoàn toàn không thông nhau). Đóng kín các đầu ống không sử dụng (con đóng p[1], cha đóng p[0] và đóng p[1] sau khi ghi) là quy tắc sống còn vì nhân Linux chỉ gửi tín hiệu EOF cho đầu đọc khi TẤT CẢ các đầu ghi p[1] ở mọi tiến trình đã đóng; nếu quên, chương trình rất dễ bị treo vĩnh viễn (deadlock). Cuối cùng, fflush(stdout) trước _exit(0) cứu dữ liệu in ra không bị bỏ rơi khi stdout bị chuyển hướng vào tệp chấm bài.",
        "complexity": "Thời gian: O(n) · Bộ nhớ: O(n) (mảng a kích thước 4n byte, tối đa ~40 KB) · Tài nguyên HĐH: 1 pipe (2 FD) + 1 tiến trình con."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện chuẩn, cấp phát động và POSIX IPC",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "<stdio.h> cung cấp scanf(), printf(), fflush(). <stdlib.h> cung cấp malloc() và free(). <unistd.h> cung cấp các syscall nền tảng của đường ống và tiến trình: pipe(), fork(), read(), write(), close(), _exit(). <sys/wait.h> cung cấp waitpid()."
        },
        {
          "lines": "Dòng 6–10",
          "title": "Đọc n và cấp phát mảng động lưu dãy số tại tiến trình cha",
          "code": "int n;\nscanf(\"%d\", &n);\nint *a = (int *)malloc(n * sizeof(int));\nfor (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);",
          "explain": "Cha đọc số lượng phần tử n (1 ≤ n ≤ 10^4), cấp phát mảng động n × 4 byte trên heap bằng malloc() rồi đọc toàn bộ dãy vào a[]. Lưu ý: dù sau khi fork() tiến trình con cũng thừa hưởng biến n và bản sao vùng nhớ của a, theo đúng yêu cầu đề bài, con KHÔNG được đọc trực tiếp từ mảng a mà bắt buộc phải nhận từng phần tử do cha gửi qua đường ống pipe."
        },
        {
          "lines": "Dòng 12–15",
          "title": "Tạo đường ống ẩn danh pipe(p) TRƯỚC khi gọi fork()",
          "code": "int p[2];\npipe(p);\n\npid_t pid = fork();",
          "explain": "Mảng int p[2] lưu hai File Descriptor của đường ống: quy ước bất di bất dịch trong Linux là p[0] để ĐỌC (read end) và p[1] để GHI (write end) — mẹo nhớ: 0 giống stdin (đọc vào), 1 giống stdout (ghi ra). Gọi pipe(p) trước fork() đảm bảo sau khi nhân bản, cả tiến trình cha lẫn tiến trình con đều giữ FD trỏ vào CÙNG một đường ống nằm trong nhân Linux."
        },
        {
          "lines": "Dòng 16–24",
          "title": "Nhánh con: đóng đầu ghi p[1], đọc đủ n số từ p[0] và cộng dồn",
          "code": "if (pid == 0) {\n    close(p[1]);\n    long long sum = 0;\n    int x;\n    for (int i = 0; i < n; i++) {\n        read(p[0], &x, sizeof(x));\n        sum += x;\n    }\n    close(p[0]);",
          "explain": "Việc đầu tiên trong nhánh con là close(p[1]) vì con chỉ đọc, không ghi — nếu giữ p[1] mở, ống sẽ không bao giờ báo EOF (gây treo nếu đọc theo vòng while). Biến sum bắt buộc dùng kiểu long long vì với n = 10^4 và |a_i| = 10^6, tổng đạt ±10^10 vượt giới hạn int 32-bit (±2.14×10^9). Lệnh read(p[0], &x, sizeof(x)) đọc đúng 4 byte nhị phân của một số int từ ống (tự động chặn chờ nếu cha chưa ghi kịp). Đọc đủ n số thì đóng nốt p[0]."
        },
        {
          "lines": "Dòng 25–28",
          "title": "Nhánh con: in kết quả, xả bộ đệm stdout và thoát bằng _exit(0)",
          "code": "    printf(\"%lld\\n\", sum);\n    fflush(stdout);\n    free(a);\n    _exit(0);",
          "explain": "Đây là chi tiết cực dễ mất điểm oan khi đi thi: khi chương trình chạy dưới trình chấm tự động (stdout được nối vào ống/tệp chứ không phải màn hình terminal), printf() dùng chế độ đệm đầy (full buffering) — dữ liệu vẫn nằm trong bộ nhớ đệm người dùng chứ chưa đẩy ra ngoài. Nếu gọi ngay _exit(0) mà quên fflush(stdout), tiến trình con chết ngay tại tầng nhân và XÓA SẠCH bộ đệm chưa in → Output rỗng! Do đó LUÔN phải gọi fflush(stdout) trước _exit(0) nếu con có in bằng printf()."
        },
        {
          "lines": "Dòng 29–39",
          "title": "Nhánh cha: đóng p[0], ghi n số vào p[1], đóng p[1], waitpid() và free()",
          "code": "} else {\n    close(p[0]);\n    for (int i = 0; i < n; i++) {\n        write(p[1], &a[i], sizeof(a[i]));\n    }\n    close(p[1]);\n    waitpid(pid, NULL, 0);\n    free(a);\n}\nreturn 0;",
          "explain": "Cha chỉ ghi nên lập tức gọi close(p[0]). Sau đó cha đẩy từng phần tử a[i] (4 byte nhị phân mỗi lần, khớp chính xác với sizeof(x) ở bên con) qua write(p[1], &a[i], sizeof(a[i])). Ghi xong phải gọi close(p[1]) để đóng đầu ghi và báo EOF cho đầu đọc. Tiếp theo waitpid(pid, NULL, 0) đợi con in xong và thu gom Zombie (truyền NULL vì không cần kiểm tra mã thoát). Nếu cha quên waitpid() và thoát sớm, con có thể trở thành tiến trình mồ côi in sau khi tiến trình chấm đã đóng luồng! Cuối cùng free(a) giải phóng bộ nhớ ở phía cha (độc lập với free(a) ở phía con)."
        }
      ],
      "testCases": [
        {
          "name": "Dãy chuẩn có cả số âm và dương",
          "caseDesc": "Input: n = 5, dãy \"10 -3 25 -7 5\". Tổng = 30.",
          "howHandled": "Cha ghi 5 lần 4 byte vào p[1]; con đọc 5 số int từ p[0], cộng dồn sum = 30, in \"30\" và fflush(stdout) trước _exit(0)."
        },
        {
          "name": "Trường hợp biên n = 1 (một phần tử âm)",
          "caseDesc": "Input: n = 1, dãy \"-1000000\".",
          "howHandled": "Vòng lặp ghi/đọc chạy đúng 1 lần, sum = -1000000, in \"-1000000\"."
        },
        {
          "name": "Dãy tối đa gây tràn int 32-bit (n = 10^4, a_i = -10^6)",
          "caseDesc": "10000 phần tử đều bằng -1000000 → tổng = -10000000000 (-10^10), tràn kiểu int; tổng dung lượng truyền 40 KB (< 64 KB dung lượng đệm pipe mặc định trên Linux).",
          "howHandled": "sum kiểu long long lưu chính xác -10000000000; cha ghi đồng thời con đọc nên ống không bao giờ đầy nghẽn."
        },
        {
          "name": "Tổng triệt tiêu bằng 0",
          "caseDesc": "Input: n = 4, dãy \"1000000 -1000000 500 -500\".",
          "howHandled": "Các số đối nhau cộng lại ra sum = 0; con in đúng \"0\"."
        }
      ],
      "examRecipe": [
        "Header: <stdio.h>, <stdlib.h>, <unistd.h>, <sys/wait.h>.",
        "Đọc n và mảng động a[] bằng malloc() ở tiến trình cha.",
        "Khai báo int p[2]; gọi pipe(p) TRƯỚC khi gọi pid_t pid = fork().",
        "Nhánh con (pid == 0): close(p[1]) → vòng for n lần read(p[0], &x, sizeof(x)) cộng vào long long sum → close(p[0]) → printf(\"%lld\\n\", sum) → fflush(stdout) → free(a) → _exit(0).",
        "Nhánh cha (else): close(p[0]) → vòng for n lần write(p[1], &a[i], sizeof(a[i])) → close(p[1]) → waitpid(pid, NULL, 0) → free(a)."
      ]
    }
  },
  {
    "num": 11,
    "id": "CR-11",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Dễ",
    "title": "Mô hình Fan-out k tiến trình con gửi kết quả về cha qua pipe()",
    "staticSummary": "Kiểm tra tĩnh fork, pipe, waitpid",
    "prompt": "Cho số nguyên dương k. Tiến trình cha tạo đúng k tiến trình con cùng cấp (fan-out: chỉ cha gọi fork(), mỗi tiến trình con xử lý xong phải thoát ngay bằng _exit(0) để không sinh thêm tiến trình cháu). Tiến trình con thứ i (i = 1..k) tính giá trị i^3 (kiểu long long) và gửi về cho tiến trình cha qua pipe(). Cha đọc đủ k giá trị gửi về, gọi waitpid() thu gom toàn bộ k con (không để lại zombie) và in tổng các lập phương.",
    "requirements": [
      "Sử dụng <unistd.h> và <sys/wait.h>.",
      "Bắt buộc dùng fork(), pipe(), waitpid() cho cả k tiến trình con.",
      "Đảm bảo mỗi tiến trình con thoát ngay sau khi gửi giá trị vào ống, tuyệt đối không tạo cây tiến trình 2^k."
    ],
    "inputSpec": "Một dòng chứa số nguyên dương k.",
    "outputSpec": "Một số nguyên (long long) là tổng 1^3 + 2^3 + ... + k^3.",
    "constraints": [
      "1 <= k <= 16"
    ],
    "example": {
      "note": "1^3 + 2^3 + 3^3 + 4^3 = 1 + 8 + 27 + 64 = 100.",
      "input": "4",
      "output": "100"
    },
    "relatedTopics": [
      {
        "id": "3-3",
        "label": "3.3 Mô hình Fan-out k con vs Cây tiến trình 2^k"
      },
      {
        "id": "3-6",
        "label": "3.6 Vòng lặp waitpid() dọn sạch Zombie"
      },
      {
        "id": "3-8",
        "label": "3.8 Ghi nguyên tử dưới PIPE_BUF trên pipe()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Trong vòng lặp for (i = 1..k) gọi fork(), nhánh pid == 0 bắt buộc phải kết thúc bằng _exit(0)! Nếu thiếu _exit(0), tiến trình con sẽ tiếp tục chạy vòng lặp sau và tự đẻ thêm cháu, biến k con thành 2^k - 1 tiến trình!",
    "relatedQuestions": [
      "CR-09",
      "CR-15",
      "CR-16",
      "CR-45"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    int k;\n    scanf(\"%d\", &k);\n\n    int p[2];\n    pipe(p);\n\n    pid_t pids[20];\n    for (int i = 1; i <= k; i++) {\n        pid_t pid = fork();\n        if (pid == 0) {\n            close(p[0]);\n            long long cube = (long long)i * i * i;\n            write(p[1], &cube, sizeof(cube));\n            close(p[1]);\n            _exit(0);\n        }\n        pids[i] = pid;\n    }\n\n    close(p[1]);\n    long long total = 0, val;\n    for (int i = 1; i <= k; i++) {\n        read(p[0], &val, sizeof(val));\n        total += val;\n    }\n    close(p[0]);\n\n    for (int i = 1; i <= k; i++) {\n        waitpid(pids[i], NULL, 0);\n    }\n\n    printf(\"%lld\\n\", total);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Mỗi gói dữ liệu sizeof(long long) = 8 byte nhỏ hơn rất nhiều so với ngưỡng PIPE_BUF (4096 byte trên Linux), nên chuẩn POSIX đảm bảo các lần write() từ k con vào chung p[1] không bao giờ bị xen kẽ byte.",
      "Lệnh _exit(0) ngay cuối nhánh con chặn đứng hiện tượng nhân bản mũ 2^k, và vòng waitpid() cuối thu gom đủ k PCB."
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
        "waitpid"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Tiến trình con thoát ngay bằng _exit() hoặc exit() tránh đẻ 2^k tiến trình",
          "regex": "\\b_?exit\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Đóng đầu ghi p[1] ở tiến trình cha trước/sau khi đọc",
          "regex": "close\\s*\\(\\s*\\w+\\s*\\[\\s*1\\s*\\]\\s*\\)",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 — Mô hình Fan-out sinh đúng k tiến trình con cùng cấp (chống bùng nổ cây 2^k), ghi nguyên tử vào pipe và thu gom sạch Zombie (Mục 3.3, 3.6, 3.8).",
      "idea": {
        "summary": "Cho số nguyên dương k, tiến trình cha tạo đúng k tiến trình con cùng cấp (hình quạt / fan-out: 1 cha sinh k con, không có tiến trình cháu). Con thứ i (i = 1..k) tính lập phương i^3 kiểu long long rồi gửi về cha qua một đường ống pipe() dùng chung; cha đọc đủ k kết quả, thu gom hết cả k con bằng waitpid() và in ra tổng 1^3 + 2^3 + ... + k^3.",
        "steps": [
          "Bước 1 — Đọc k và tạo 1 đường ống dùng chung: Cha đọc số nguyên k (1 ≤ k ≤ 16) và gọi pipe(p) trước vòng lặp sinh tiến trình.",
          "Bước 2 — Vòng lặp Fan-out sinh đúng k con: Cha chạy vòng for i = 1..k gọi fork(). Lưu PID của từng con vào mảng pids[i] để thu gom ở cuối.",
          "Bước 3 — Tiến trình con tính i^3, gửi vào ống và thoát ngay: Trong if (pid == 0), con đóng p[0], tính cube = (long long)i * i * i, ghi 8 byte vào p[1], đóng p[1] rồi BẮT BUỘC gọi _exit(0) để không tiếp tục chạy vòng for gọi fork() tạo tiến trình cháu.",
          "Bước 4 — Cha đóng p[1] và thu nhận đủ k kết quả: Sau khi sinh hết k con, cha gọi close(p[1]), lặp k lần đọc từng biến long long val từ p[0] cộng dồn vào total, rồi đóng p[0].",
          "Bước 5 — Thu gom đủ k con và in kết quả: Cha chạy vòng for i = 1..k gọi waitpid(pids[i], NULL, 0) để dọn sạch cả k tiến trình con (0 Zombie), rồi in total."
        ],
        "whyThisWay": "Trong vòng lặp gọi fork(), lệnh _exit(0) ở cuối nhánh con là \"phanh khẩn cấp\" quyết định mô hình Fan-out: nếu thiếu _exit(0), tiến trình con sẽ tiếp tục lặp các giá trị i còn lại và tự đẻ ra tiến trình cháu, tạo thành cây 2^k tiến trình (fork bomb) làm sai kết quả hoàn toàn. Dùng chung 1 ống pipe cho k con cùng ghi vẫn an toàn 100% vì chuẩn POSIX đảm bảo mọi lệnh write() có kích thước ≤ PIPE_BUF (4096 byte trên Linux; ở đây sizeof(long long) = 8 byte) đều thực thi NGUYÊN TỬ (atomic), không bao giờ bị trộn lẫn byte giữa các con, và phép cộng có tính giao hoán nên thứ tự đọc không ảnh hưởng tổng.",
        "complexity": "Thời gian: O(k) (song song trên k tiến trình con) · Bộ nhớ: O(k) (mảng pids[20]) · Tài nguyên HĐH: 1 pipe (2 FD) + k tiến trình con."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện I/O và quản lý tiến trình",
          "code": "#include <stdio.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "<stdio.h> cho scanf/printf; <unistd.h> cho pipe(), fork(), read(), write(), close(), _exit() và kiểu pid_t; <sys/wait.h> cho waitpid(). Không cần <stdlib.h> vì bài dùng mảng tĩnh pids[20] và thoát con bằng _exit(0)."
        },
        {
          "lines": "Dòng 5–10",
          "title": "Nhập k và tạo đường ống dùng chung p[2]",
          "code": "int k;\nscanf(\"%d\", &k);\n\nint p[2];\npipe(p);",
          "explain": "Cha đọc k (1 ≤ k ≤ 16) rồi tạo một đường ống duy nhất p[2] (p[0] đọc, p[1] ghi) TRƯỚC vòng lặp fork(). Tất cả k tiến trình con được sinh ra sau đó đều kế thừa chung đường ống này theo mô hình nhiều người ghi – một người đọc (MPSC: Multiple Producers, Single Consumer)."
        },
        {
          "lines": "Dòng 12–23",
          "title": "Vòng lặp Fan-out sinh đúng k con và chặn sinh tiến trình cháu",
          "code": "pid_t pids[20];\nfor (int i = 1; i <= k; i++) {\n    pid_t pid = fork();\n    if (pid == 0) {\n        close(p[0]);\n        long long cube = (long long)i * i * i;\n        write(p[1], &cube, sizeof(cube));\n        close(p[1]);\n        _exit(0);\n    }\n    pids[i] = pid;\n}",
          "explain": "Mảng pids[20] dư sức chứa tối đa 16 PID (chỉ số 1..k). Ở mỗi vòng lặp, chỉ có tiến trình cha chạy tới cuối vòng và lưu pids[i] = pid. Trong nhánh con (pid == 0): (1) close(p[0]) đóng đầu đọc không dùng; (2) ép kiểu (long long)i trước khi nhân i * i để tính toán trên 64-bit tránh tràn kiểu int; (3) write(p[1], &cube, 8) ghi nguyên tử 8 byte vào ống; (4) close(p[1]) và gọi NGAY _exit(0). Nếu quên _exit(0), con thứ 1 sẽ nhảy lên i = 2, gọi fork() lần nữa và làm bùng nổ 2^k tiến trình!"
        },
        {
          "lines": "Dòng 25–31",
          "title": "Cha đóng đầu ghi p[1] và đọc đủ k kết quả từ ống",
          "code": "close(p[1]);\nlong long total = 0, val;\nfor (int i = 1; i <= k; i++) {\n    read(p[0], &val, sizeof(val));\n    total += val;\n}\nclose(p[0]);",
          "explain": "Sau khi vòng lặp sinh con kết thúc, cha không bao giờ ghi vào ống nên phải gọi close(p[1]) ngay — giữ p[1] mở ở cha là lỗi kinh điển khiến đầu đọc không bao giờ nhận được EOF khi tất cả con đã thoát. Cha lặp đúng k lần gọi read(p[0], &val, sizeof(val)): bất kỳ con nào tính xong trước sẽ gửi 8 byte trước, cha cộng dồn vào total (nhờ tính giao hoán a + b = b + a nên thứ tự đến bất kỳ vẫn cho tổng chính xác tuyệt đối). Đọc xong thì đóng p[0]."
        },
        {
          "lines": "Dòng 33–35",
          "title": "Thu gom toàn bộ k tiến trình con bằng waitpid()",
          "code": "for (int i = 1; i <= k; i++) {\n    waitpid(pids[i], NULL, 0);\n}",
          "explain": "Mỗi tiến trình con sau khi gọi _exit(0) sẽ chuyển sang trạng thái Zombie cho đến khi cha thu gom. Một lệnh waitpid() chỉ thu gom được ĐÚNG 1 tiến trình con, do đó bắt buộc dùng vòng lặp k lần gọi waitpid(pids[i], NULL, 0) cho từng PID đã lưu để đảm bảo không sót bất kỳ Zombie nào. Nếu chỉ gọi waitpid() 1 lần, k − 1 con còn lại sẽ thành Zombie."
        },
        {
          "lines": "Dòng 37–39",
          "title": "In tổng lập phương và kết thúc chương trình",
          "code": "printf(\"%lld\\n\", total);\nreturn 0;",
          "explain": "In tổng 1^3 + 2^3 + ... + k^3 bằng đặc tả \"%lld\" tương ứng kiểu long long kèm ký tự xuống dòng, rồi kết thúc tiến trình cha với mã trả về 0."
        }
      ],
      "testCases": [
        {
          "name": "Biên nhỏ nhất (k = 1)",
          "caseDesc": "Input: \"1\". Chỉ sinh đúng 1 tiến trình con tính 1^3 = 1.",
          "howHandled": "1 con ghi 1 vào p[1] rồi _exit(0); cha đọc 1 lần, waitpid 1 lần, in \"1\"."
        },
        {
          "name": "Trường hợp chuẩn (k = 4)",
          "caseDesc": "Input: \"4\". 1^3 + 2^3 + 3^3 + 4^3 = 1 + 8 + 27 + 64 = 100.",
          "howHandled": "4 con chạy song song ghi nguyên tử 4 gói 8 byte không trộn lẫn; cha cộng đủ 4 số theo thứ tự đến bất kỳ và in \"100\"."
        },
        {
          "name": "Trường hợp trung bình (k = 10)",
          "caseDesc": "Input: \"10\". Theo công thức [k(k+1)/2]^2 = 55^2 = 3025.",
          "howHandled": "Đúng 10 con cùng cấp (không có con nào tạo cháu nhờ _exit(0)), cha thu gom đủ 10 PID và in \"3025\"."
        },
        {
          "name": "Biên lớn nhất (k = 16)",
          "caseDesc": "Input: \"16\". [16 × 17 / 2]^2 = 136^2 = 18496; kiểm tra ghi đồng thời 16 tiến trình con vào 1 pipe.",
          "howHandled": "16 × 8 = 128 byte ≪ PIPE_BUF (4096 byte) nên mọi lần write đều nguyên tử, mảng pids[20] đủ chỗ cho chỉ số 1..16, in \"18496\"."
        }
      ],
      "examRecipe": [
        "Header: <stdio.h>, <unistd.h>, <sys/wait.h>.",
        "Đọc k, tạo 1 ống int p[2]; pipe(p); và mảng pid_t pids[20];.",
        "Viết vòng for (i = 1..k): gọi fork(); trong nhánh pid == 0 đóng p[0], tính (long long)i*i*i, write(p[1], &cube, sizeof(cube)), close(p[1]) và PHẢI gọi _exit(0) ngay!",
        "Ở nhánh cha ngoài if: lưu pids[i] = pid.",
        "Sau vòng lặp sinh con: close(p[1]) → vòng for k lần read(p[0], &val, sizeof(val)) cộng vào total → close(p[0]).",
        "Chạy vòng for k lần waitpid(pids[i], NULL, 0) để dọn hết Zombie rồi printf(\"%lld\\n\", total)."
      ]
    }
  },
  {
    "num": 12,
    "id": "CR-12",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Trung bình",
    "title": "Giao tiếp hai chiều cha - con bằng hai ống pipe()",
    "staticSummary": "Kiểm tra tĩnh fork, pipe, waitpid",
    "prompt": "Thiết lập kênh truyền thông hai chiều giữa tiến trình cha và tiến trình con sử dụng hai đường ống riêng biệt (một ống chiều cha -> con và một ống chiều con -> cha). Tiến trình cha đọc n số nguyên từ stdin và gửi mảng sang cho con; tiến trình con lọc và tính tổng tất cả các số nguyên tố trong mảng nhận được, rồi gửi kết quả (long long) ngược lại cho cha qua ống thứ hai. Tiến trình cha nhận tổng, đợi con kết thúc bằng waitpid() và in kết quả.",
    "requirements": [
      "Sử dụng <unistd.h> và <sys/wait.h>.",
      "Bắt buộc tạo 2 mảng ống pipe (4 File Descriptor) riêng cho 2 chiều truyền nhận cùng fork() và waitpid().",
      "Đóng kín các đầu ống không dùng ở cả cha và con ngay sau fork() và sau khi ghi xong.",
      "Lưu ý số nguyên <= 1 (kể cả số âm, 0, 1) không phải số nguyên tố."
    ],
    "inputSpec": "Dòng 1: số nguyên n. Dòng 2: n số nguyên a_1, ..., a_n.",
    "outputSpec": "Một số nguyên (long long) là tổng các số nguyên tố có trong mảng (0 nếu không có số nguyên tố nào).",
    "constraints": [
      "1 <= n <= 10^4",
      "-10^6 <= a_i <= 10^6"
    ],
    "example": {
      "note": "Các số nguyên tố trong dãy [1, 2, 4, 7, 11, -5, 9] là 2, 7, 11 -> tổng = 20.",
      "input": "7\n1 2 4 7 11 -5 9",
      "output": "20"
    },
    "relatedTopics": [
      {
        "id": "3-8",
        "label": "3.8 Thiết kế kênh Full-Duplex bằng 2 ống pipe() một chiều"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Một pipe() chuẩn POSIX chỉ truyền dữ liệu một chiều (half-duplex). Nếu cả cha và con cùng đọc/ghi trên một ống duy nhất, cha có thể tự đọc lại dữ liệu do chính mình vừa ghi! Muốn giao tiếp 2 chiều bắt buộc phải tạo 2 ống độc lập.",
    "relatedQuestions": [
      "CR-10",
      "CR-13",
      "CR-42"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint is_prime(int x) {\n    if (x <= 1) return 0;\n    for (int i = 2; (long long)i * i <= x; i++) {\n        if (x % i == 0) return 0;\n    }\n    return 1;\n}\n\nint main() {\n    int p1[2], p2[2];\n    pipe(p1);\n    pipe(p2);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        close(p1[1]);\n        close(p2[0]);\n\n        int n, x;\n        long long sum = 0;\n        read(p1[0], &n, sizeof(n));\n        for (int i = 0; i < n; i++) {\n            read(p1[0], &x, sizeof(x));\n            if (is_prime(x)) sum += x;\n        }\n        close(p1[0]);\n\n        write(p2[1], &sum, sizeof(sum));\n        close(p2[1]);\n        _exit(0);\n    } else {\n        close(p1[0]);\n        close(p2[1]);\n\n        int n;\n        scanf(\"%d\", &n);\n        int *a = (int *)malloc(n * sizeof(int));\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n        write(p1[1], &n, sizeof(n));\n        for (int i = 0; i < n; i++) {\n            write(p1[1], &a[i], sizeof(a[i]));\n        }\n        close(p1[1]);\n\n        long long sum = 0;\n        read(p2[0], &sum, sizeof(sum));\n        close(p2[0]);\n\n        waitpid(pid, NULL, 0);\n        printf(\"%lld\\n\", sum);\n        free(a);\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Ngay sau fork(), con đóng p2c[1] & c2p[0], cha đóng p2c[0] & c2p[1] để tách bạch hoàn toàn hai chiều truyền nhận.",
      "Hàm kiểm tra nguyên tố O(sqrt(x)) xử lý chặt chẽ x < 2 (loại bỏ số âm, 0 và 1) và dùng d * d <= x kiểu long long."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "pipe",
        "fork",
        "waitpid",
        "read",
        "write",
        "close"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Gọi pipe() 2 lần tạo 2 đường ống riêng cho 2 chiều cha <-> con",
          "regex": "pipe\\s*\\([^)]+\\)[\\s\\S]+pipe\\s*\\([^)]+\\)",
          "flags": ""
        },
        {
          "desc": "Kiểm tra loại bỏ các số <= 1 khi xét số nguyên tố",
          "regex": "<\\s*2|<=\\s*1",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 — Giao tiếp hai chiều (Full-Duplex) Cha ↔ Con bằng 2 ống pipe() độc lập (Mục 3.8 · Lab 3 Bài 5 · Mẫu câu kinh điển đề thi ELT 3296).",
      "idea": {
        "summary": "Vì một ống pipe() trong Linux chỉ truyền dữ liệu được theo MỘT chiều, để tiến trình cha gửi mảng n số nguyên cho con và nhận lại tổng các số nguyên tố do con tính, ta phải tạo 2 ống riêng biệt: p1 (chiều Cha → Con) và p2 (chiều Con → Cha). Mỗi bên đóng chéo đúng 2 đầu ống mình không dùng, trao đổi dữ liệu theo giao thức rõ ràng (gửi n trước rồi gửi n phần tử), sau đó cha thu gom con và in kết quả.",
        "steps": [
          "Bước 1 — Cài đặt hàm kiểm tra số nguyên tố is_prime(x): Trả về 0 với mọi x ≤ 1 (loại cả số âm, 0, 1), duyệt ước i từ 2 đến √x bằng điều kiện (long long)i * i <= x.",
          "Bước 2 — Tạo 2 đường ống TRƯỚC fork(): Gọi pipe(p1) cho chiều Cha → Con và pipe(p2) cho chiều Con → Cha, rồi gọi fork().",
          "Bước 3 — Đóng chéo các đầu ống không dùng: Con chỉ đọc p1 và ghi p2 nên đóng p1[1] và p2[0]. Cha chỉ ghi p1 và đọc p2 nên đóng p1[0] và p2[1].",
          "Bước 4 — Cha đọc input & gửi qua p1: Cha đọc n và mảng a[] từ stdin, ghi n vào p1[1] rồi ghi lần lượt n phần tử a[i] vào p1[1], sau đó đóng p1[1] báo EOF.",
          "Bước 5 — Con nhận từ p1, lọc số nguyên tố & gửi tổng qua p2: Con đọc n từ p1[0], đọc lần lượt n số x, nếu is_prime(x) đúng thì cộng vào sum (long long), đóng p1[0], ghi sum vào p2[1], đóng p2[1] và _exit(0).",
          "Bước 6 — Cha nhận kết quả từ p2 và dọn dẹp: Cha đọc sum từ p2[0], đóng p2[0], gọi waitpid() thu gom con, in sum và giải phóng mảng a."
        ],
        "whyThisWay": "Một ống pipe là kênh bán song công/một chiều: nếu cả cha lẫn con cùng đọc và ghi trên chung 1 ống, tiến trình vừa ghi xong có thể tự đọc lại chính dữ liệu của mình hoặc gây deadlock. Dùng 2 ống tách bạch cùng quy tắc \"đóng chéo\" đảm bảo dữ liệu đi đúng 1 chiều trên mỗi ống và cơ chế báo EOF hoạt động chính xác. Ngoài ra, việc chỉ để cha đọc stdin (sau fork) và gửi số lượng n qua p1 trước khi gửi mảng giúp con biết chính xác cần đọc bao nhiêu số mà không phụ thuộc vào bộ nhớ trước fork.",
        "complexity": "Thời gian: O(n × √M) với M = max|a_i| ≤ 10^6 (√M ≤ 1000, rất nhanh) · Bộ nhớ: O(n) ở cha, O(1) ở con · Tài nguyên HĐH: 2 pipe (4 FD) + 1 tiến trình con."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện chuẩn và hệ thống POSIX",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "Bộ 4 thư viện kinh điển cho bài lập trình tiến trình kèm mảng động: <stdio.h> (scanf/printf), <stdlib.h> (malloc/free), <unistd.h> (pipe/fork/read/write/close/_exit), <sys/wait.h> (waitpid)."
        },
        {
          "lines": "Dòng 6–12",
          "title": "Hàm is_prime(int x) kiểm tra số nguyên tố an toàn",
          "code": "int is_prime(int x) {\n    if (x <= 1) return 0;\n    for (int i = 2; (long long)i * i <= x; i++) {\n        if (x % i == 0) return 0;\n    }\n    return 1;\n}",
          "explain": "Dòng if (x <= 1) return 0; là chốt chặn cực quan trọng vì đề bài cho phép a_i âm (tới -10^6), 0 và 1 — tất cả đều KHÔNG phải số nguyên tố. Vòng lặp kiểm tra ước i từ 2 đến √x bằng (long long)i * i <= x vừa tránh dùng hàm sqrt() (phải link -lm và có sai số dấu phẩy động) vừa tránh tràn số int khi nhân i * i. Nếu có ước chia hết thì trả 0, ngược lại trả 1."
        },
        {
          "lines": "Dòng 14–19",
          "title": "Khởi tạo 2 đường ống p1, p2 và gọi fork()",
          "code": "int p1[2], p2[2];\npipe(p1);\npipe(p2);\n\npid_t pid = fork();",
          "explain": "Quy ước rõ để không bao giờ nhầm khi viết code thi: p1 là đường đi từ Cha → Con (Cha ghi p1[1], Con đọc p1[0]); p2 là đường về từ Con → Cha (Con ghi p2[1], Cha đọc p2[0]). Cả hai lệnh pipe() phải đặt TRƯỚC fork() để 4 File Descriptor được chia sẻ giữa hai tiến trình."
        },
        {
          "lines": "Dòng 20–31",
          "title": "Nhánh con: đóng chéo ống, đọc n và n số từ p1, tính tổng nguyên tố",
          "code": "if (pid == 0) {\n    close(p1[1]);\n    close(p2[0]);\n    int n, x;\n    long long sum = 0;\n    read(p1[0], &n, sizeof(n));\n    for (int i = 0; i < n; i++) {\n        read(p1[0], &x, sizeof(x));\n        if (is_prime(x)) sum += x;\n    }\n    close(p1[0]);",
          "explain": "Con đóng ngay 2 đầu thừa: p1[1] (con không ghi vào p1) và p2[0] (con không đọc từ p2). Lệnh read(p1[0], &n, sizeof(n)) sẽ tự động chặn chờ cho tới khi cha nhập xong và gửi n sang. Sau đó con đọc lần lượt từng số x từ p1[0] (không cần cấp phát mảng ở con, tiết kiệm RAM O(1)!), gọi is_prime(x) và cộng dồn vào long long sum. Đọc xong thì đóng p1[0]."
        },
        {
          "lines": "Dòng 33–35",
          "title": "Nhánh con: gửi kết quả về cha qua p2[1] và thoát _exit(0)",
          "code": "    write(p2[1], &sum, sizeof(sum));\n    close(p2[1]);\n    _exit(0);",
          "explain": "Con gửi đúng 8 byte của biến long long sum vào đầu ghi p2[1] của ống thứ hai, đóng p2[1] để báo EOF cho cha rồi thoát sạch bằng _exit(0). Vì con không in ra stdout nên không cần fflush(stdout)."
        },
        {
          "lines": "Dòng 36–49",
          "title": "Nhánh cha: đóng chéo ống, đọc mảng từ stdin và truyền sang con qua p1[1]",
          "code": "} else {\n    close(p1[0]);\n    close(p2[1]);\n    int n;\n    scanf(\"%d\", &n);\n    int *a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    write(p1[1], &n, sizeof(n));\n    for (int i = 0; i < n; i++) write(p1[1], &a[i], sizeof(a[i]));\n    close(p1[1]);",
          "explain": "Cha đóng chéo ngược lại với con: đóng p1[0] (cha không đọc p1) và p2[1] (cha không ghi p2). Cha đọc n và mảng a[] từ stdin, sau đó ghi n trước rồi ghi từng phần tử a[i] vào p1[1] — khớp 1-1 với thứ tự read() ở tiến trình con. Ghi xong phải close(p1[1]) ngay để kết thúc chiều truyền Cha → Con."
        },
        {
          "lines": "Dòng 51–60",
          "title": "Nhánh cha: nhận tổng từ p2[0], thu gom con, in kết quả và giải phóng bộ nhớ",
          "code": "    long long sum = 0;\n    read(p2[0], &sum, sizeof(sum));\n    close(p2[0]);\n    waitpid(pid, NULL, 0);\n    printf(\"%lld\\n\", sum);\n    free(a);\n}\nreturn 0;",
          "explain": "Cha chặn đọc 8 byte kết quả từ p2[0] (khớp với sizeof(sum) kiểu long long mà con đã ghi), rồi đóng p2[0]. Lưu ý thứ tự an toàn: đọc p2[0] TRƯỚC rồi mới gọi waitpid(pid, NULL, 0) để tránh trường hợp con bị nghẽn ghi ống trong khi cha chờ con chết. Cuối cùng in sum với \"%lld\\n\" và gọi free(a) giải phóng bộ nhớ động."
        }
      ],
      "testCases": [
        {
          "name": "Mảng hỗn hợp số âm, 0, 1, hợp số và nguyên tố",
          "caseDesc": "Input: n = 7, dãy \"-5 0 1 2 3 4 17\". Các số nguyên tố là 2, 3, 17 → tổng = 22.",
          "howHandled": "is_prime loại -5, 0, 1 (nhờ x <= 1) và 4; chỉ cộng 2 + 3 + 17 = 22 rồi gửi qua p2 về cha in \"22\"."
        },
        {
          "name": "Không có số nguyên tố nào trong mảng",
          "caseDesc": "Input: n = 5, dãy \"-10 -2 0 1 9\".",
          "howHandled": "sum khởi tạo bằng 0 không thay đổi, con gửi 0 qua p2[1], cha in đúng \"0\"."
        },
        {
          "name": "Biên n = 1 với số nguyên tố nhỏ nhất (2) và số 1",
          "caseDesc": "Input: n = 1, dãy \"2\" (output 2) và n = 1, dãy \"1\" (output 0).",
          "howHandled": "Với x = 2, vòng lặp i = 2 có 2*2 <= 2 sai ngay nên trả về 1 (nguyên tố). Với x = 1, x <= 1 trả về 0."
        },
        {
          "name": "Mảng lớn gồm 10^4 số nguyên tố lớn gần 10^6 (bẫy tràn int)",
          "caseDesc": "n = 10000 phần tử đều là 999983 (số nguyên tố) → tổng = 9999830000 (~10^10 > 2^31 - 1).",
          "howHandled": "Biến sum ở cả con và cha đều là long long (truyền 8 byte qua p2), không tràn số; kiểm tra 10^4 lần tốn ~10^7 phép chia (< 0.05 giây)."
        }
      ],
      "examRecipe": [
        "Viết hàm is_prime(int x): if (x <= 1) return 0; for (int i = 2; (long long)i * i <= x; i++) if (x % i == 0) return 0; return 1;.",
        "Trong main(): khai báo int p1[2], p2[2]; gọi pipe(p1); pipe(p2); TRƯỚC fork().",
        "Nhớ bảng ĐÓNG CHÉO sau fork(): Con đóng p1[1], p2[0] (chỉ dùng p1[0] đọc, p2[1] ghi); Cha đóng p1[0], p2[1] (chỉ dùng p1[1] ghi, p2[0] đọc).",
        "Nhánh cha: đọc n & mảng a[] → write n & từng a[i] vào p1[1] → close(p1[1]) → read long long sum từ p2[0] → close(p2[0]) → waitpid() → printf(\"%lld\\n\", sum) → free(a).",
        "Nhánh con: read n & từng x từ p1[0] → nếu is_prime(x) cộng vào long long sum → close(p1[0]) → write sum vào p2[1] → close(p2[1]) → _exit(0)."
      ]
    }
  },
  {
    "num": 13,
    "id": "CR-13",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Trung bình",
    "title": "Chuyển hướng I/O với dup2() và thực thi wc -w qua exec()",
    "staticSummary": "Kiểm tra tĩnh fork, pipe, dup2, execlp/execvp/execv, waitpid",
    "prompt": "Viết chương trình C trong đó tiến trình cha đọc toàn bộ văn bản đầu vào từ stdin (có thể gồm nhiều dòng cho tới EOF), tạo tiến trình con bằng fork(), dùng hai ống pipe() và dup2() để chuyển hướng STDIN_FILENO và STDOUT_FILENO của con, sau đó ở tiến trình con gọi execlp(\"wc\", \"wc\", \"-w\", NULL) (hoặc execvp) để chạy tiện ích wc -w của Linux. Cha truyền văn bản sang ống đầu vào, đọc kết quả số từ từ ống đầu ra, thu gom con và in số nguyên đó ra stdout.",
    "requirements": [
      "Sử dụng <unistd.h> và <sys/wait.h>.",
      "Bắt buộc sử dụng fork(), pipe(), dup2(), họ hàm exec* (execlp/execvp/execv gọi lệnh wc -w) và waitpid().",
      "Đóng đầu ghi của ống cấp dữ liệu ở cha sau khi truyền xong văn bản để wc nhận biết EOF; xử lý cả đầu vào rỗng (in 0).",
      "Không tự viết vòng lặp đếm từ trong C để thay thế cho việc gọi wc."
    ],
    "inputSpec": "Văn bản gồm 0, 1 hoặc nhiều dòng cho tới hết stdin (EOF).",
    "outputSpec": "Một số nguyên duy nhất là số từ đếm được bởi wc -w.",
    "constraints": [
      "0 <= độ dài văn bản <= 65536 byte"
    ],
    "example": {
      "note": "Văn bản gồm 5 từ phân tách bởi khoảng trắng / xuống dòng.",
      "input": "Advanced   Programming\nTechniques Linux   Process",
      "output": "5"
    },
    "relatedTopics": [
      {
        "id": "1-2",
        "label": "1.2 Cơ chế Chuyển hướng I/O & Đường ống trong Shell"
      },
      {
        "id": "3-4",
        "label": "3.4 Họ hàm exec() nạp chương trình mới giữ nguyên bảng FD"
      },
      {
        "id": "3-8",
        "label": "3.8 Kết hợp pipe() + dup2() + exec() chuẩn Linux"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Sau khi gọi dup2(p_in[0], STDIN_FILENO) và dup2(p_out[1], STDOUT_FILENO), tiến trình con phải đóng cả 4 đầu ống gốc. Ở cha, sau khi bơm xong văn bản vào p_in[1], bắt buộc gọi close(p_in[1]) để lệnh wc nhận EOF — nếu quên đóng p_in[1], wc sẽ đứng chờ vĩnh viễn gây Time Limit Exceeded!",
    "relatedQuestions": [
      "CR-10",
      "CR-12"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    int p_in[2], p_out[2];\n    pipe(p_in);\n    pipe(p_out);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        close(p_in[1]);\n        close(p_out[0]);\n\n        dup2(p_in[0], STDIN_FILENO);\n        dup2(p_out[1], STDOUT_FILENO);\n        close(p_in[0]);\n        close(p_out[1]);\n\n        execlp(\"wc\", \"wc\", \"-w\", NULL);\n        _exit(1);\n    } else {\n        close(p_in[0]);\n        close(p_out[1]);\n\n        char buf[4096];\n        ssize_t n;\n        while ((n = read(STDIN_FILENO, buf, sizeof(buf))) > 0) {\n            ssize_t off = 0;\n            while (off < n) {\n                ssize_t w = write(p_in[1], buf + off, n - off);\n                if (w <= 0) break;\n                off += w;\n            }\n        }\n        close(p_in[1]);\n\n        char out[128];\n        int len = 0;\n        while ((n = read(p_out[0], out + len, sizeof(out) - 1 - len)) > 0) {\n            len += n;\n        }\n        out[len] = '\\0';\n        close(p_out[0]);\n\n        waitpid(pid, NULL, 0);\n        long long words = 0;\n        sscanf(out, \"%lld\", &words);\n        printf(\"%lld\\n\", words);\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Đọc toàn bộ stdin bằng read(STDIN_FILENO, ...) hỗ trợ văn bản nhiều dòng đến tận EOF (kể cả đầu vào rỗng 0 byte).",
      "Dùng strtoll(out_buf, NULL, 10) loại bỏ mọi khoảng trắng căn lề mà lệnh wc -w có thể in kèm trên một số bản phân phối Linux, đảm bảo in ra đúng 1 số nguyên sạch."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "pipe",
        "fork",
        "dup2",
        "waitpid"
      ],
      "forbiddenApis": [
        "system",
        "popen"
      ],
      "qualityRules": [
        {
          "desc": "Gọi họ hàm exec* (execlp / execvp / execv) thực thi lệnh wc -w",
          "regex": "\\bexec(lp|vp|v|ve|l)\\s*\\([\\s\\S]*\"wc\"[\\s\\S]*\"-w\"",
          "flags": ""
        },
        {
          "desc": "Chuyển hướng cả STDIN_FILENO và STDOUT_FILENO bằng dup2()",
          "regex": "dup2\\s*\\([^)]+\\)[\\s\\S]+dup2\\s*\\([^)]+\\)",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 — Chuyển hướng luồng chuẩn STDIN/STDOUT bằng dup2() kết hợp thay thế ảnh tiến trình bằng execlp() chạy tiện ích hệ thống (Mục 3.4, 3.8 · Lab 3 Bài 6 · Slide APT03).",
      "idea": {
        "summary": "Đề bài yêu cầu không tự đếm từ bằng C mà phải chạy lệnh hệ thống `wc -w` của Linux trong một tiến trình con. Để `wc -w` đọc được văn bản do cha cung cấp và trả kết quả về lại cho cha (thay vì đọc bàn phím / in ra màn hình), ta tạo 2 đường ống p_in và p_out, dùng dup2() ở tiến trình con để \"cắm\" hai ống này thay thế cho STDIN_FILENO (0) và STDOUT_FILENO (1), rồi gọi execlp(\"wc\", \"wc\", \"-w\", NULL).",
        "steps": [
          "Bước 1 — Tạo 2 đường ống trước fork(): p_in để cha bơm văn bản vào stdin của `wc`; p_out để `wc` in kết quả stdout trả ngược về cho cha.",
          "Bước 2 — Nhân bản tiến trình: Gọi fork() tạo tiến trình con.",
          "Bước 3 — Chuyển hướng I/O trong con bằng dup2(): Con đóng 2 đầu thừa (p_in[1], p_out[0]), gọi dup2(p_in[0], STDIN_FILENO) và dup2(p_out[1], STDOUT_FILENO) để nối ống vào FD 0 và FD 1, rồi đóng 2 FD gốc p_in[0], p_out[1].",
          "Bước 4 — Thay thế ảnh tiến trình bằng execlp(): Con gọi execlp(\"wc\", \"wc\", \"-w\", NULL) để nạp chương trình `wc` chạy ngay trên tiến trình con (với FD 0, 1 đã nối sẵn vào 2 ống). Nếu exec thất bại mới rơi xuống _exit(1).",
          "Bước 5 — Cha bơm toàn bộ văn bản sang p_in[1] và ĐÓNG p_in[1]: Cha đọc từng khối 4 KB từ STDIN_FILENO và ghi hết vào p_in[1] (có vòng lặp xử lý short-write). Xong xuôi PHẢI gọi close(p_in[1]) để `wc` nhận EOF và bắt đầu xuất kết quả.",
          "Bước 6 — Cha đọc kết quả từ p_out[0], thu gom con và chuẩn hóa output: Cha đọc chuỗi kết quả từ p_out[0] tới EOF, đóng p_out[0], gọi waitpid(), dùng sscanf() lọc lấy số nguyên sạch (bỏ khoảng trắng thừa của `wc`) rồi in ra stdout."
        ],
        "whyThisWay": "Cơ chế dup2() + exec() chính là cách Linux Shell (bash) thực thi các lệnh có đường ống như `cat file | wc -w`. Khi gọi execlp(), toàn bộ mã lệnh và biến C của con bị thay thế hoàn toàn bởi `wc`, nhưng bảng File Descriptor (gồm FD 0 và FD 1 vừa chuyển hướng bằng dup2) được GIỮ NGUYÊN! Việc cha bắt buộc phải đóng p_in[1] ngay sau khi bơm hết dữ liệu là chìa khóa tránh Deadlock hai chiều: `wc -w` chỉ chịu in số từ sau khi gặp EOF trên stdin, nên nếu cha quên close(p_in[1]) thì `wc` đợi cha mãi mãi còn cha lại đợi p_out[0] mãi mãi.",
        "complexity": "Thời gian: O(L) với L là độ dài văn bản (≤ 64 KB) · Bộ nhớ: O(1) (bộ đệm cố định 4 KB + 128 byte) · Tài nguyên HĐH: 2 pipe (4 FD) + 1 tiến trình con chạy `wc`."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện chuẩn và POSIX",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "<stdio.h> cho sscanf() và printf(); <stdlib.h> là thư viện chuẩn đi kèm; <unistd.h> cung cấp pipe(), fork(), dup2(), execlp(), read(), write(), close(), _exit() cùng hai hằng số STDIN_FILENO (0) và STDOUT_FILENO (1); <sys/wait.h> cung cấp waitpid()."
        },
        {
          "lines": "Dòng 6–11",
          "title": "Tạo hai đường ống p_in, p_out và gọi fork()",
          "code": "int p_in[2], p_out[2];\npipe(p_in);\npipe(p_out);\n\npid_t pid = fork();",
          "explain": "Đặt tên gợi nhớ giúp không bao giờ nhầm đầu ống: p_in là ống cấp đầu vào (input) cho `wc` (Cha ghi p_in[1] → Con đọc p_in[0]); p_out là ống hứng đầu ra (output) của `wc` (Con ghi p_out[1] → Cha đọc p_out[0]). Cả hai pipe() đều gọi trước fork()."
        },
        {
          "lines": "Dòng 12–19",
          "title": "Nhánh con: đóng đầu thừa và nối ống vào STDIN / STDOUT bằng dup2()",
          "code": "if (pid == 0) {\n    close(p_in[1]);\n    close(p_out[0]);\n\n    dup2(p_in[0], STDIN_FILENO);\n    dup2(p_out[1], STDOUT_FILENO);\n    close(p_in[0]);\n    close(p_out[1]);",
          "explain": "Con đóng trước 2 đầu không dùng (p_in[1] và p_out[0]). Lệnh dup2(oldfd, newfd) đóng newfd (nếu đang mở) và cho newfd trỏ vào cùng tệp/ống với oldfd một cách nguyên tử: dup2(p_in[0], STDIN_FILENO) biến FD 0 thành đầu đọc của p_in; dup2(p_out[1], STDOUT_FILENO) biến FD 1 thành đầu ghi của p_out. Ngay sau khi dup2 xong, ta PHẢI đóng hai FD gốc p_in[0] và p_out[1] vì FD 0 và FD 1 đã thay thế chúng hoàn toàn — giữ bản sao thừa sẽ làm rò rỉ FD và sai lệch bộ đếm tham chiếu của pipe."
        },
        {
          "lines": "Dòng 21–22",
          "title": "Nhánh con: nạp và chạy tiện ích wc -w bằng execlp()",
          "code": "    execlp(\"wc\", \"wc\", \"-w\", NULL);\n    _exit(1);",
          "explain": "Họ hàm exec thay thế toàn bộ mã chương trình hiện tại bằng chương trình mới. Chữ \"l\" (list) nghĩa là truyền tham số rời từng đối số; chữ \"p\" (path) nghĩa là tự tìm lệnh \"wc\" trong biến môi trường PATH (không cần gõ \"/usr/bin/wc\"). Chú ý danh sách đối số cực dễ nhầm: đối số 1 (\"wc\") là tên chương trình cần tìm, đối số 2 (\"wc\") là argv[0] truyền vào chương trình đó (người mới rất hay quên lặp lại \"wc\"!), đối số 3 (\"-w\") là cờ đếm từ, và đối số cuối BẮT BUỘC là NULL để kết thúc danh sách. Nếu execlp thành công nó KHÔNG BAO GIỜ quay lại; dòng _exit(1) chỉ chạy khi exec lỗi (ví dụ không tìm thấy wc)."
        },
        {
          "lines": "Dòng 23–37",
          "title": "Nhánh cha: bơm văn bản từ stdin vào p_in[1] (chống short-write) rồi đóng p_in[1]",
          "code": "} else {\n    close(p_in[0]);\n    close(p_out[1]);\n    char buf[4096];\n    ssize_t n;\n    while ((n = read(STDIN_FILENO, buf, sizeof(buf))) > 0) {\n        ssize_t off = 0;\n        while (off < n) {\n            ssize_t w = write(p_in[1], buf + off, n - off);\n            if (w <= 0) break;\n            off += w;\n        }\n    }\n    close(p_in[1]);",
          "explain": "Cha đóng p_in[0] và p_out[1]. Vòng lặp ngoài đọc từng khối tối đa 4096 byte từ STDIN_FILENO cho đến khi gặp EOF (read trả về 0, lưu bằng kiểu có dấu ssize_t để bắt được -1 hoặc 0). Vòng lặp trong while (off < n) xử lý trường hợp ghi thiếu (short write): nếu 1 lệnh write() chỉ đẩy được w < n byte vào ống do ống đầy tạm thời, con trỏ dịch sang buf + off để ghi tiếp phần còn lại n - off. Dòng 37 close(p_in[1]) là LỆNH QUAN TRỌNG NHẤT BÀI: đóng đầu ghi để báo EOF cho `wc -w`, nếu quên `wc` sẽ đứng chờ mãi mãi gây treo (deadlock)!"
        },
        {
          "lines": "Dòng 39–45",
          "title": "Nhánh cha: đọc chuỗi kết quả của wc từ p_out[0] tới EOF",
          "code": "    char out[128];\n    int len = 0;\n    while ((n = read(p_out[0], out + len, sizeof(out) - 1 - len)) > 0) {\n        len += n;\n    }\n    out[len] = '\\0';\n    close(p_out[0]);",
          "explain": "Sau khi `wc -w` nhận EOF, nó in số từ ra STDOUT (tức p_out[1]) rồi kết thúc, làm đóng p_out[1] và gửi EOF về cho cha. Cha đọc vòng lặp vào mảng out[128] (chừa sẵn 1 byte cuối nhờ sizeof(out) - 1 - len để không bao giờ tràn mảng), gắn ký tự kết thúc chuỗi '\\0' tại out[len], rồi đóng p_out[0]."
        },
        {
          "lines": "Dòng 47–53",
          "title": "Nhánh cha: thu gom con, tách số nguyên sạch bằng sscanf() và in ra",
          "code": "    waitpid(pid, NULL, 0);\n    long long words = 0;\n    sscanf(out, \"%lld\", &words);\n    printf(\"%lld\\n\", words);\n}\nreturn 0;",
          "explain": "Gọi waitpid(pid, NULL, 0) để thu gom tiến trình con chạy `wc`, tránh để lại Zombie. Vì một số phiên bản `wc` in thêm khoảng trắng ở đầu hoặc cuối (ví dụ \"   12\\n\"), nếu in thẳng chuỗi out sẽ có thể sai định dạng trình chấm; dùng sscanf(out, \"%lld\", &words) tự động bỏ qua mọi khoảng trắng và trích xuất đúng con số nguyên sạch, sau đó in \"%lld\\n\"."
        }
      ],
      "testCases": [
        {
          "name": "Văn bản nhiều dòng, nhiều khoảng trắng và tab",
          "caseDesc": "Input: \"Hello   world\\n\\tLinux   system   programming\\n\". Có đúng 5 từ.",
          "howHandled": "Cha bơm nguyên văn sang `wc -w` qua p_in, đóng p_in[1]; `wc` trả \"5\\n\" qua p_out; sscanf trích words = 5 và in \"5\"."
        },
        {
          "name": "Đầu vào rỗng hoàn toàn (0 byte)",
          "caseDesc": "Input: EOF ngay lập tức (0 byte).",
          "howHandled": "Vòng while read(STDIN_FILENO) kết thúc ngay (n == 0), cha gọi close(p_in[1]) gửi EOF cho `wc -w`. `wc -w` in \"0\", cha nhận và in \"0\"."
        },
        {
          "name": "Đầu vào chỉ gồm khoảng trắng và dòng trống",
          "caseDesc": "Input: \"   \\n\\t  \\n   \". Không có từ nào.",
          "howHandled": "`wc -w` bỏ qua toàn bộ ký tự trắng (whitespace) và xuất \"0\", cha in \"0\"."
        },
        {
          "name": "Văn bản lớn sát giới hạn 64 KB (nhiều khối 4 KB)",
          "caseDesc": "Input dài 65536 byte gồm hàng nghìn từ trải trên 16 lần đọc buffer 4096 byte.",
          "howHandled": "Vòng lặp chống short-write bơm hết từng khối trong khi `wc` đọc liên tục (không đầy bộ đệm 64 KB của pipe), đóng p_in[1] và nhận đúng tổng số từ."
        }
      ],
      "examRecipe": [
        "Header: <stdio.h>, <stdlib.h>, <unistd.h>, <sys/wait.h>.",
        "Tạo 2 ống p_in[2], p_out[2] TRƯỚC fork().",
        "Nhánh con: close(p_in[1]); close(p_out[0]); → dup2(p_in[0], STDIN_FILENO); dup2(p_out[1], STDOUT_FILENO); → close(p_in[0]); close(p_out[1]); → execlp(\"wc\", \"wc\", \"-w\", NULL); _exit(1);.",
        "Nhánh cha: close(p_in[0]); close(p_out[1]); → đọc stdin bằng read() ghi sang p_in[1] tới EOF → BẮT BUỘC close(p_in[1]) ngay!.",
        "Cha đọc p_out[0] vào buffer out[] tới EOF → gắn '\\0' → close(p_out[0]) → waitpid() → sscanf(out, \"%lld\", &words) → printf(\"%lld\\n\", words)."
      ]
    }
  },
  {
    "num": 14,
    "id": "CR-14",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Trung bình",
    "title": "Đồng bộ và đếm tín hiệu bằng sigaction() và kill()",
    "staticSummary": "Kiểm tra tĩnh fork, sigaction/signal, kill, waitpid",
    "prompt": "Cho số nguyên không âm m. Tiến trình con cần gửi đúng m lần tín hiệu SIGUSR1 cho tiến trình cha. Vì các tín hiệu chuẩn POSIX (SIGUSR1) không xếp hàng nếu gửi liên tiếp khi đang bị xử lý, hãy cài đặt cơ chế bắt tay: trước khi fork(), chuẩn bị bộ xử lý tín hiệu SIGUSR1 ở cha và SIGUSR2 ở con (dùng volatile sig_atomic_t và khuyến khích dùng sigprocmask/sigsuspend để tránh race condition). Mỗi lần con gửi SIGUSR1 bằng kill(getppid(), SIGUSR1), con chờ cha gửi lại SIGUSR2 xác nhận rồi mới gửi tín hiệu kế tiếp. Sau khi con gửi đủ m lần và thoát, cha gọi waitpid() và in số tín hiệu đã nhận.",
    "requirements": [
      "Sử dụng <signal.h>, <unistd.h>, <sys/wait.h>.",
      "Bắt buộc dùng fork(), sigaction() (hoặc signal()), kill(), waitpid().",
      "Các biến chia sẻ với signal handler phải khai báo volatile sig_atomic_t.",
      "Không dùng sleep() hay usleep() để canh thời gian, và không tự gán thẳng biến đếm bằng m mà không gửi/nhận tín hiệu thật."
    ],
    "inputSpec": "Một dòng chứa số nguyên không âm m.",
    "outputSpec": "Một số nguyên là tổng số lần tín hiệu SIGUSR1 được tiến trình cha tiếp nhận.",
    "constraints": [
      "0 <= m <= 500"
    ],
    "example": {
      "note": "Con và cha bắt tay 12 lượt qua cặp SIGUSR1 / SIGUSR2 không rơi mất tín hiệu nào.",
      "input": "12",
      "output": "12"
    },
    "relatedTopics": [
      {
        "id": "3-7",
        "label": "3.7 Tín hiệu POSIX (Signals), sigaction() & volatile sig_atomic_t"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Tín hiệu chuẩn POSIX không có hàng đợi (nếu con bắn liên tiếp 12 tín hiệu SIGUSR1 không chờ xác nhận, cha có thể chỉ đếm được 1–2 lần!). Chặn trước tín hiệu bằng sigprocmask(SIG_BLOCK) rồi mở chặn nguyên tử trong lúc ngủ chờ bằng sigsuspend() là mẫu chuẩn POSIX triệt tiêu hoàn toàn race condition.",
    "relatedQuestions": [
      "CR-16",
      "CR-49"
    ],
    "starterCode": "",
    "solution": "#define _POSIX_C_SOURCE 200809L\n#include <stdio.h>\n#include <signal.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nvolatile sig_atomic_t parent_count = 0;\nvolatile sig_atomic_t got_usr1 = 0;\nvolatile sig_atomic_t got_ack = 0;\n\nvoid handle_usr1(int sig) {\n    (void)sig;\n    parent_count++;\n    got_usr1 = 1;\n}\n\nvoid handle_usr2(int sig) {\n    (void)sig;\n    got_ack = 1;\n}\n\nint main() {\n    int m;\n    scanf(\"%d\", &m);\n\n    sigset_t mask, oldmask;\n    sigemptyset(&mask);\n    sigaddset(&mask, SIGUSR1);\n    sigaddset(&mask, SIGUSR2);\n    sigprocmask(SIG_BLOCK, &mask, &oldmask);\n\n    struct sigaction sa1 = {0}, sa2 = {0};\n    sa1.sa_handler = handle_usr1;\n    sa2.sa_handler = handle_usr2;\n    sigaction(SIGUSR1, &sa1, NULL);\n    sigaction(SIGUSR2, &sa2, NULL);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        for (int i = 0; i < m; i++) {\n            got_ack = 0;\n            kill(getppid(), SIGUSR1);\n            while (!got_ack) {\n                sigsuspend(&oldmask);\n            }\n        }\n        _exit(0);\n    } else {\n        for (int i = 0; i < m; i++) {\n            while (!got_usr1) {\n                sigsuspend(&oldmask);\n            }\n            got_usr1 = 0;\n            kill(pid, SIGUSR2);\n        }\n        waitpid(pid, NULL, 0);\n        printf(\"%d\\n\", (int)parent_count);\n    }\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Chặn trước SIGUSR1, SIGUSR2 và SIGCHLD bằng sigprocmask(SIG_BLOCK, ...) trước fork() để không tín hiệu nào tới sớm bị lọt vào khoảng hở trước lệnh chờ.",
      "Hàm sigsuspend(&empty_mask) mở khóa mặt nạ tín hiệu và đưa tiến trình vào giấc ngủ một cách nguyên tử, hoàn toàn không dùng sleep()/usleep() và xử lý gọn cả biên m = 0."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "signal.h",
        "unistd.h",
        "sys/wait.h"
      ],
      "requiredApis": [
        "fork",
        "kill",
        "waitpid",
        "SIGUSR1",
        "SIGUSR2",
        "sig_atomic_t"
      ],
      "forbiddenApis": [
        "sleep",
        "usleep",
        "nanosleep"
      ],
      "qualityRules": [
        {
          "desc": "Khai báo biến cờ chia sẻ với handler là volatile sig_atomic_t",
          "regex": "volatile\\s+sig_atomic_t",
          "flags": ""
        },
        {
          "desc": "Sử dụng sigaction() và sigsuspend() để tránh race condition mất tín hiệu",
          "regex": "\\bsigaction\\b[\\s\\S]*\\bsigsuspend\\b",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng pause() trần trong vòng lặp dễ rơi vào race condition ngủ vĩnh viễn nếu tín hiệu tới ngay trước pause()!",
          "regex": "\\bpause\\s*\\(\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 3 — Tín hiệu POSIX (Signals): sigaction(), kill(), biến volatile sig_atomic_t và cơ chế bắt tay chống mất tín hiệu bằng sigprocmask() + sigsuspend() (Mục 3.7 · Slide APT03).",
      "idea": {
        "summary": "Đề bài yêu cầu tiến trình con gửi đúng m lần tín hiệu SIGUSR1 lên tiến trình cha để cha đếm. Vì tín hiệu chuẩn POSIX KHÔNG xếp hàng (gửi dồn nhiều cái liên tiếp sẽ bị gộp mất thành 1), ta phải cài giao thức \"bắt tay\" (handshake): con gửi 1 lần SIGUSR1 rồi ngủ chờ cha phản hồi lại 1 lần SIGUSR2 xác nhận mới gửi tiếp lần sau; kết hợp sigprocmask(SIG_BLOCK) và sigsuspend() để loại bỏ hoàn toàn race condition mất tín hiệu.",
        "steps": [
          "Bước 1 — Khai báo biến cờ an toàn với tín hiệu: Khai báo 3 biến toàn cục parent_count, got_usr1, got_ack kiểu volatile sig_atomic_t cùng hai hàm handler ngắn gọn handle_usr1 (tăng đếm, bật cờ) và handle_usr2 (bật cờ xác nhận).",
          "Bước 2 — Chặn tạm thời SIGUSR1 & SIGUSR2 TRƯỚC fork(): Dùng sigemptyset, sigaddset và sigprocmask(SIG_BLOCK, &mask, &oldmask) để giữ tín hiệu ở trạng thái chờ (pending) cho đến khi tiến trình chủ động mở khóa khi đi ngủ.",
          "Bước 3 — Đăng ký handler bằng sigaction() TRƯỚC fork(): Cài handle_usr1 cho SIGUSR1 và handle_usr2 cho SIGUSR2 rồi mới gọi fork(), giúp cả cha lẫn con kế thừa ngay bộ xử lý và mặt nạ tín hiệu mà không bị lệch thời điểm.",
          "Bước 4 — Vòng bắt tay ở tiến trình con (lặp m lần): Reset got_ack = 0, gửi kill(getppid(), SIGUSR1) cho cha, rồi chờ trong while (!got_ack) sigsuspend(&oldmask) cho tới khi nhận được SIGUSR2 xác nhận từ cha. Xong m lần thì _exit(0).",
          "Bước 5 — Vòng bắt tay ở tiến trình cha (lặp m lần): Chờ trong while (!got_usr1) sigsuspend(&oldmask) cho tới khi nhận SIGUSR1, reset got_usr1 = 0, gửi lại kill(pid, SIGUSR2) báo cho con gửi tiếp.",
          "Bước 6 — Thu gom và in kết quả: Sau đủ m lượt bắt tay, cha gọi waitpid() thu gom con rồi in giá trị parent_count."
        ],
        "whyThisWay": "Tín hiệu chuẩn POSIX (như SIGUSR1) chỉ được nhân Linux đánh dấu bằng ĐÚNG 1 bit trong mặt nạ pending — nếu con gọi kill() 500 lần liên tục mà không đợi xác nhận, các tín hiệu đến khi cha chưa kịp xử lý sẽ bị gộp mất làm số đếm nhỏ hơn m rất nhiều! Hơn nữa, nếu dùng pause() thông thường mà không chặn tín hiệu trước bằng sigprocmask(SIG_BLOCK), tín hiệu phản hồi có thể đến NGAY TRƯỚC khi tiến trình kịp gọi pause() khiến nó ngủ vĩnh viễn (lost-wakeup deadlock). sigsuspend(&oldmask) giải quyết triệt để vì nó mở chặn tín hiệu và đi ngủ trong MỘT thao tác nguyên tử của nhân.",
        "complexity": "Thời gian: O(m) lượt bắt tay tín hiệu (m ≤ 500 chạy chỉ vài mili-giây) · Bộ nhớ: O(1) · Tài nguyên HĐH: 1 tiến trình con + 2 tín hiệu người dùng SIGUSR1/SIGUSR2."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Bật chuẩn POSIX.1-2008 và khai báo thư viện tín hiệu",
          "code": "#define _POSIX_C_SOURCE 200809L\n#include <stdio.h>\n#include <signal.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "Dòng 1 #define _POSIX_C_SOURCE 200809L (phải đặt TRÊN CÙNG trước mọi #include) là chi tiết sống còn khi biên dịch với cờ -std=c11: chuẩn C11 thuần ẩn các hàm/struct mở rộng của POSIX như struct sigaction, sigset_t, sigprocmask, sigsuspend, kill; thiếu dòng này gcc sẽ báo lỗi biên dịch \"storage size of sa1 isn't known\"! <signal.h> chứa toàn bộ API tín hiệu, <unistd.h> chứa fork(), getppid(), _exit()."
        },
        {
          "lines": "Dòng 7–9",
          "title": "Khai báo các biến cờ toàn cục kiểu volatile sig_atomic_t",
          "code": "volatile sig_atomic_t parent_count = 0;\nvolatile sig_atomic_t got_usr1 = 0;\nvolatile sig_atomic_t got_ack = 0;",
          "explain": "Mọi biến dùng chung giữa luồng chính (main) và signal handler BẮT BUỘC phải mang 2 từ khóa này: (1) volatile cấm trình biên dịch tối ưu (-O2) lưu biến vào thanh ghi CPU trong vòng while (!got_usr1) — ép CPU luôn đọc lại từ RAM vì handler có thể đột ngột đổi giá trị bất kỳ lúc nào; nếu thiếu volatile, vòng while có thể lặp vô hạn! (2) sig_atomic_t đảm bảo mọi thao tác đọc/ghi biến là nguyên tử 1 nhịp, không bị xé đôi nếu tín hiệu ngắt giữa chừng."
        },
        {
          "lines": "Dòng 11–20",
          "title": "Định nghĩa hai hàm xử lý tín hiệu (Signal Handlers)",
          "code": "void handle_usr1(int sig) {\n    (void)sig;\n    parent_count++;\n    got_usr1 = 1;\n}\nvoid handle_usr2(int sig) {\n    (void)sig;\n    got_ack = 1;\n}",
          "explain": "Quy tắc vàng của signal handler là cực ngắn và chỉ dùng thao tác async-signal-safe (tuyệt đối không gọi printf/malloc bên trong handler). handle_usr1 chạy ở cha mỗi khi nhận SIGUSR1: tăng bộ đếm parent_count và bật cờ got_usr1 = 1. handle_usr2 chạy ở con mỗi khi nhận SIGUSR2 xác nhận từ cha: bật cờ got_ack = 1. Dòng (void)sig; để tắt cảnh báo biến tham số không dùng khi biên dịch với -Wall -Wextra."
        },
        {
          "lines": "Dòng 22–30",
          "title": "Đọc m và chặn tạm thời SIGUSR1, SIGUSR2 bằng sigprocmask()",
          "code": "int m;\nscanf(\"%d\", &m);\nsigset_t mask, oldmask;\nsigemptyset(&mask);\nsigaddset(&mask, SIGUSR1);\nsigaddset(&mask, SIGUSR2);\nsigprocmask(SIG_BLOCK, &mask, &oldmask);",
          "explain": "Tạo tập tín hiệu mask rỗng (sigemptyset), thêm SIGUSR1 và SIGUSR2 vào tập (sigaddset), rồi gọi sigprocmask(SIG_BLOCK, &mask, &oldmask) để TẠM CHẶN cả 2 tín hiệu này đồng thời lưu lại mặt nạ cũ (chưa chặn) vào oldmask. Lưu ý: \"chặn\" (block) không phải là vứt bỏ tín hiệu, mà là giữ tín hiệu ở trạng thái chờ (pending) để nó KHÔNG bao giờ chạy ngang xương giữa dòng code thường, chỉ được giải phóng đúng lúc gọi sigsuspend(&oldmask)."
        },
        {
          "lines": "Dòng 32–38",
          "title": "Đăng ký bộ xử lý bằng sigaction() và gọi fork()",
          "code": "struct sigaction sa1 = {0}, sa2 = {0};\nsa1.sa_handler = handle_usr1;\nsa2.sa_handler = handle_usr2;\nsigaction(SIGUSR1, &sa1, NULL);\nsigaction(SIGUSR2, &sa2, NULL);\n\npid_t pid = fork();",
          "explain": "Khởi tạo {0} xóa sạch mọi trường rác trong struct sigaction (gồm sa_mask rỗng và sa_flags = 0). Gán con trỏ hàm xử lý cho sa_handler và đăng ký với nhân bằng sigaction() (chuẩn POSIX tin cậy hơn signal() cổ điển vì không bị reset handler về mặc định sau lần bắn đầu tiên). Đăng ký cả sigprocmask lẫn sigaction TRƯỚC fork() đảm bảo con sinh ra có sẵn ngay handler và mask, loại trừ hoàn toàn nguy cơ con bắn SIGUSR1 sớm làm chết cha trước khi cha kịp cài handler (hành động mặc định của SIGUSR1 là kết thúc tiến trình!)."
        },
        {
          "lines": "Dòng 39–47",
          "title": "Nhánh con: gửi SIGUSR1 và chờ xác nhận SIGUSR2 bằng sigsuspend()",
          "code": "if (pid == 0) {\n    for (int i = 0; i < m; i++) {\n        got_ack = 0;\n        kill(getppid(), SIGUSR1);\n        while (!got_ack) {\n            sigsuspend(&oldmask);\n        }\n    }\n    _exit(0);",
          "explain": "Trong mỗi lượt i = 0..m-1: con đặt got_ack = 0 rồi gọi kill(getppid(), SIGUSR1) để gửi SIGUSR1 lên đúng PID của cha (getppid()). Dù cha có phản hồi SIGUSR2 cực nhanh ngay trước khi con tới dòng 43, SIGUSR2 vẫn đang bị block nên không bị trôi mất mà nằm chờ sẵn! Khi con gọi sigsuspend(&oldmask), nhân Linux NGUYÊN TỬ thay mặt nạ hiện tại bằng oldmask (mở chặn SIGUSR2) và cho con ngủ; SIGUSR2 lập tức kích hoạt handle_usr2 (đặt got_ack = 1), sau đó sigsuspend tự khôi phục lại mặt nạ chặn và thoát vòng while. Dùng vòng while (!got_ack) phòng trường hợp bị tín hiệu lạ đánh thức sớm."
        },
        {
          "lines": "Dòng 48–60",
          "title": "Nhánh cha: chờ SIGUSR1, gửi lại SIGUSR2 xác nhận, thu gom con và in tổng",
          "code": "} else {\n    for (int i = 0; i < m; i++) {\n        while (!got_usr1) {\n            sigsuspend(&oldmask);\n        }\n        got_usr1 = 0;\n        kill(pid, SIGUSR2);\n    }\n    waitpid(pid, NULL, 0);\n    printf(\"%d\\n\", (int)parent_count);\n}\nreturn 0;",
          "explain": "Cha thực hiện đúng nửa kia của giao thức bắt tay: chờ trong while (!got_usr1) sigsuspend(&oldmask) để nhận 1 tín hiệu SIGUSR1 (handle_usr1 đã tự tăng parent_count++ và bật got_usr1 = 1), sau đó reset got_usr1 = 0 rồi gửi kill(pid, SIGUSR2) báo cho con được phép gửi lượt tiếp theo. Sau đủ m lượt, cha gọi waitpid(pid, NULL, 0) đợi con thoát sạch rồi in (int)parent_count ra stdout."
        }
      ],
      "testCases": [
        {
          "name": "Biên m = 0 (không gửi tín hiệu nào)",
          "caseDesc": "Input: \"0\".",
          "howHandled": "Cả hai vòng for (i = 0; i < 0; i++) đều không chạy lần nào; con thoát ngay _exit(0), cha waitpid() và in \"0\" không bị treo."
        },
        {
          "name": "Biên m = 1 (một lượt bắt tay duy nhất)",
          "caseDesc": "Input: \"1\".",
          "howHandled": "Con gửi 1 SIGUSR1 → cha nhận (parent_count = 1) và trả 1 SIGUSR2 → con nhận và thoát → cha in \"1\"."
        },
        {
          "name": "Trường hợp chuẩn (m = 50)",
          "caseDesc": "Input: \"50\".",
          "howHandled": "50 vòng gửi–xác nhận luân phiên chính xác, không dùng sleep/usleep, in đúng \"50\"."
        },
        {
          "name": "Biên tối đa m = 500 (stress-test chống gộp tín hiệu & race condition)",
          "caseDesc": "Input: \"500\". Nếu gửi liên tiếp không bắt tay sẽ bị mất hàng trăm tín hiệu; nếu dùng pause() không block sẽ dễ bị deadlock.",
          "howHandled": "Nhờ sigprocmask(SIG_BLOCK) + sigsuspend(&oldmask), toàn bộ 500 tín hiệu được trao đổi an toàn 100%, không mất tín hiệu nào và không bao giờ treo, in \"500\"."
        }
      ],
      "examRecipe": [
        "Đặt #define _POSIX_C_SOURCE 200809L ở dòng ĐẦU TIÊN trước <stdio.h>, <signal.h>, <unistd.h>, <sys/wait.h>.",
        "Khai báo 3 biến toàn cục volatile sig_atomic_t: parent_count, got_usr1, got_ack và 2 handler handle_usr1, handle_usr2.",
        "TRƯỚC fork(): dùng sigemptyset + sigaddset + sigprocmask(SIG_BLOCK, &mask, &oldmask) chặn SIGUSR1, SIGUSR2; rồi đăng ký 2 handler bằng struct sigaction = {0} và sigaction().",
        "Nhánh con (for m lần): got_ack = 0 → kill(getppid(), SIGUSR1) → while (!got_ack) sigsuspend(&oldmask) → xong vòng lặp thì _exit(0).",
        "Nhánh cha (for m lần): while (!got_usr1) sigsuspend(&oldmask) → got_usr1 = 0 → kill(pid, SIGUSR2) → xong vòng lặp thì waitpid() và printf(\"%d\\n\", (int)parent_count)."
      ]
    }
  },
  {
    "num": 15,
    "id": "CR-15",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Khó",
    "title": "Tính tích vô hướng hai vector bằng k tiến trình con",
    "staticSummary": "Kiểm tra tĩnh fork, pipe, waitpid",
    "prompt": "Cho hai vector số nguyên A, B độ dài n và số tiến trình con k. Tiến trình cha đọc dữ liệu từ stdin, tạo mảng gồm các đường ống pipe() riêng biệt và sinh tối đa min(n, k) tiến trình con bằng fork(). Mỗi tiến trình con phụ trách một đoạn chỉ số liên tiếp [L, R] được phân hoạch tĩnh, tính tổng tích cục bộ sum A[i] * B[i] (kiểu long long) và gửi qua ống riêng về cho cha. Cha đọc tất cả kết quả cục bộ, gọi waitpid() cho mọi tiến trình con và in tích vô hướng.",
    "requirements": [
      "Sử dụng <unistd.h> và <sys/wait.h>.",
      "Bắt buộc dùng fork(), mảng pipe() riêng cho từng con để tránh trộn byte khi ghi đồng thời, và waitpid().",
      "Đóng đầy đủ các đầu ống không dùng; không dùng pthread thay cho fork()."
    ],
    "inputSpec": "Dòng 1: hai số nguyên n k. Dòng 2: n số nguyên của vector A. Dòng 3: n số nguyên của vector B.",
    "outputSpec": "Một số nguyên (long long) là tích vô hướng của A và B.",
    "constraints": [
      "1 <= n <= 10^5",
      "1 <= k <= 8",
      "-10^4 <= A_i, B_i <= 10^4"
    ],
    "example": {
      "note": "1*2 + (-2)*3 + 3*(-1) + 4*0 + 5*4 = 2 - 6 - 3 + 0 + 20 = 13.",
      "input": "5 3\n1 -2 3 4 5\n2 3 -1 0 4",
      "output": "13"
    },
    "relatedTopics": [
      {
        "id": "3-3",
        "label": "3.3 Chia việc cho nhiều tiến trình con với fork()"
      },
      {
        "id": "3-8",
        "label": "3.8 Mảng đường ống IPC riêng cho từng Worker"
      },
      {
        "id": "5-4",
        "label": "5.4 Phương pháp Phân hoạch Tĩnh (Foster Methodology)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Khi tạo mảng pipes[w][2] trước vòng lặp fork(), hãy nhớ rằng tiến trình con thứ i sẽ thừa kế cả các đầu ống của các con 0..w-1! Vì vậy con i nên đóng các đầu ống không liên quan, chỉ ghi vào pipes[i][1] rồi _exit(0).",
    "relatedQuestions": [
      "CR-11",
      "CR-27",
      "CR-45"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    int n, k;\n    scanf(\"%d %d\", &n, &k);\n\n    int *A = (int *)malloc(n * sizeof(int));\n    int *B = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &A[i]);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &B[i]);\n\n    int procs = (k < n) ? k : n;\n    int pipes[8][2];\n    pid_t pids[8];\n\n    int base = n / procs;\n    int rem = n % procs;\n\n    for (int c = 0; c < procs; c++) {\n        pipe(pipes[c]);\n        int L = c * base + (c < rem ? c : rem);\n        int R = L + base + (c < rem ? 1 : 0);\n\n        pid_t pid = fork();\n        if (pid == 0) {\n            close(pipes[c][0]);\n            for (int j = 0; j < c; j++) close(pipes[j][0]);\n\n            long long part = 0;\n            for (int i = L; i < R; i++) {\n                part += (long long)A[i] * B[i];\n            }\n            write(pipes[c][1], &part, sizeof(part));\n            close(pipes[c][1]);\n            free(A);\n            free(B);\n            _exit(0);\n        } else {\n            pids[c] = pid;\n            close(pipes[c][1]);\n        }\n    }\n\n    long long dot = 0;\n    for (int c = 0; c < procs; c++) {\n        long long part = 0;\n        read(pipes[c][0], &part, sizeof(part));\n        close(pipes[c][0]);\n        dot += part;\n    }\n\n    for (int c = 0; c < procs; c++) {\n        waitpid(pids[c], NULL, 0);\n    }\n\n    printf(\"%lld\\n\", dot);\n    free(A);\n    free(B);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Giới hạn số tiến trình w = min(n, k) và chia đều phần dư n % w cho các tiến trình đầu tiên để cân bằng tải hoàn hảo.",
      "Mỗi tiến trình con sở hữu đường ống riêng pipes[i] và đóng sạch các đầu ống không liên quan ngay sau fork()."
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
        "read",
        "write",
        "close"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Xử lý w = min(n, k) và phân hoạch phần dư n % w",
          "regex": "%|\\brem\\b",
          "flags": ""
        },
        {
          "desc": "Tiến trình con kết thúc bằng _exit(0) sau khi gửi kết quả",
          "regex": "\\b_?exit\\s*\\(",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 + Chương 5 — Tính toán song song (Data Parallelism) bằng k tiến trình con với phân hoạch tĩnh đều và mảng ống pipe riêng biệt (Mục 3.8, 5.4).",
      "idea": {
        "summary": "Để tính tích vô hướng của hai vector A, B độ dài n bằng tối đa k tiến trình con, tiến trình cha đọc sẵn A, B vào bộ nhớ trước khi fork() (nhờ cơ chế Copy-on-Write, các con đọc chung dữ liệu mà không cần truyền mảng qua ống). Cha chia đều n chỉ số thành procs = min(n, k) đoạn liên tiếp [L, R), tạo cho mỗi con một ống pipe riêng, sinh các con tính tổng tích cục bộ song song rồi gom đủ procs kết quả cộng lại.",
        "steps": [
          "Bước 1 — Nhập dữ liệu trước fork(): Cha đọc n, k, cấp phát động và đọc 2 mảng A, B độ dài n từ stdin.",
          "Bước 2 — Chặn số tiến trình thực tế & chuẩn bị phân hoạch đều: Tính procs = min(k, n) để tránh tạo con thừa khi k > n; tính base = n / procs và rem = n % procs (rem con đầu mỗi con gánh base + 1 phần tử, các con sau gánh base phần tử).",
          "Bước 3 — Vòng lặp sinh procs tiến trình con với ống riêng: Ở mỗi bước c = 0..procs-1, cha tạo pipes[c], tính đoạn nửa mở [L, R) của con c và gọi fork().",
          "Bước 4 — Xử lý trong con thứ c: Con đóng pipes[c][0] và đóng nốt tất cả các pipes[0..c-1][0] kế thừa từ cha, tính tổng tích cục bộ part += (long long)A[i] * B[i] cho i ∈ [L, R), ghi part vào pipes[c][1], đóng ống, giải phóng A, B và _exit(0). Cha lưu pids[c] và đóng pipes[c][1].",
          "Bước 5 — Cha gom kết quả & dọn dẹp: Cha lặp c = 0..procs-1 đọc từng part từ pipes[c][0] cộng vào dot rồi đóng pipes[c][0]; sau đó gọi waitpid() cho cả procs con, in dot và giải phóng A, B."
        ],
        "whyThisWay": "Đọc A và B trước fork() tận dụng cơ chế Copy-on-Write của Linux: mọi tiến trình con dùng chung các trang RAM vật lý chỉ đọc của A, B nên không tốn thời gian bơm 800 KB dữ liệu qua ống mà chỉ cần truyền ngược 8 byte kết quả cục bộ! Cấp mỗi con một ống pipes[c] riêng biệt loại bỏ hoàn toàn cạnh tranh ghi và đảm bảo từng kênh 1-1 tách bạch. Ngoài ra, công thức phân hoạch có phần dư rem giúp tải giữa các tiến trình con chênh nhau tối đa 1 phần tử (cân bằng tải tối ưu).",
        "complexity": "Thời gian: O(n / min(n, k)) tính song song (tổng công O(n)) · Bộ nhớ: O(n) (dùng chung trang RAM chỉ đọc nhờ Copy-on-Write) · Tài nguyên HĐH: procs pipe + procs tiến trình con (procs ≤ 8)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện chuẩn và hệ thống tiến trình",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "<stdio.h> cho scanf/printf; <stdlib.h> cho malloc/free cấp phát hai vector độ dài tới 10^5; <unistd.h> cho pipe(), fork(), read(), write(), close(), _exit(); <sys/wait.h> cho waitpid()."
        },
        {
          "lines": "Dòng 6–13",
          "title": "Đọc n, k và nạp toàn bộ hai vector A, B trước khi fork()",
          "code": "int n, k;\nscanf(\"%d %d\", &n, &k);\nint *A = (int *)malloc(n * sizeof(int));\nint *B = (int *)malloc(n * sizeof(int));\nfor (int i = 0; i < n; i++) scanf(\"%d\", &A[i]);\nfor (int i = 0; i < n; i++) scanf(\"%d\", &B[i]);",
          "explain": "Mảng A, B có tối đa 10^5 phần tử (~400 KB mỗi mảng) nên cấp phát trên heap bằng malloc() là an toàn nhất. Việc đọc xong hết A, B TRƯỚC fork() giúp mọi tiến trình con sinh ra ngay lập tức có sẵn toàn bộ dữ liệu để đọc nhờ cơ chế Copy-on-Write (vì con chỉ đọc A[i], B[i] chứ không sửa, nhân Linux thậm chí không phải sao chép vật lý hai mảng này!)."
        },
        {
          "lines": "Dòng 15–20",
          "title": "Chặn số tiến trình procs = min(k, n) và tính tham số phân hoạch",
          "code": "int procs = (k < n) ? k : n;\nint pipes[8][2];\npid_t pids[8];\n\nint base = n / procs;\nint rem = n % procs;",
          "explain": "Ràng buộc k ≤ 8 nên mảng tĩnh pipes[8][2] và pids[8] đủ chỗ cho tối đa 8 con. Dòng int procs = (k < n) ? k : n; xử lý trường hợp biên k > n (ví dụ n = 3, k = 8): chỉ sinh đúng 3 con thay vì 8 con để không có tiến trình nào rảnh rỗi với đoạn rỗng. Chia đều n phần tử cho procs con: mỗi con có ít nhất base = n / procs phần tử, còn rem = n % procs phần tử dư sẽ được rải thêm 1 phần tử cho rem con đầu tiên (c = 0..rem-1)."
        },
        {
          "lines": "Dòng 22–27",
          "title": "Tạo ống riêng pipes[c], tính đoạn chỉ số [L, R) và gọi fork()",
          "code": "for (int c = 0; c < procs; c++) {\n    pipe(pipes[c]);\n    int L = c * base + (c < rem ? c : rem);\n    int R = L + base + (c < rem ? 1 : 0);\n\n    pid_t pid = fork();",
          "explain": "Hãy kiểm chứng công thức phân hoạch nửa mở [L, R) với ví dụ n = 10, procs = 3 (base = 3, rem = 1): con c = 0 có L = 0, R = 4 (4 phần tử: 0,1,2,3); con c = 1 có L = 3 + 1 = 4, R = 7 (3 phần tử: 4,5,6); con c = 2 có L = 6 + 1 = 7, R = 10 (3 phần tử: 7,8,9). Mọi chỉ số từ 0 đến n - 1 được phủ kín tuyệt đối, không trùng lặp và không bỏ sót phần tử nào! Tạo pipe(pipes[c]) ngay trước mỗi lần fork()."
        },
        {
          "lines": "Dòng 28–45",
          "title": "Nhánh con: đóng FD kế thừa, tính tích cục bộ & ghi ống; Nhánh cha: lưu PID & đóng đầu ghi",
          "code": "    if (pid == 0) {\n        close(pipes[c][0]);\n        for (int j = 0; j < c; j++) close(pipes[j][0]);\n        long long part = 0;\n        for (int i = L; i < R; i++) part += (long long)A[i] * B[i];\n        write(pipes[c][1], &part, sizeof(part));\n        close(pipes[c][1]);\n        free(A); free(B);\n        _exit(0);\n    } else {\n        pids[c] = pid;\n        close(pipes[c][1]);\n    }",
          "explain": "Chú ý chi tiết đẳng cấp ở dòng 30: for (int j = 0; j < c; j++) close(pipes[j][0]); — vì ở thời điểm sinh con c, tiến trình cha vẫn đang giữ mở các đầu đọc pipes[0][0]..pipes[c-1][0] của những con trước đó, nên con c kế thừa hết chúng; đóng sạch chúng trong con c giúp không rò rỉ FD. Phép nhân (long long)A[i] * B[i] ép sang 64-bit trước khi nhân và cộng vào long long part (tổng có thể tới 10^5 × 10^8 = 10^13, vượt xa int!). Con ghi 8 byte part vào pipes[c][1], đóng ống, free(A), free(B) và gọi _exit(0) để không sinh cháu. Ở nhánh cha, cha lưu pids[c] và đóng ngay đầu ghi pipes[c][1]."
        },
        {
          "lines": "Dòng 47–57",
          "title": "Cha thu nhận đủ procs tổng cục bộ và thu gom toàn bộ con bằng waitpid()",
          "code": "long long dot = 0;\nfor (int c = 0; c < procs; c++) {\n    long long part = 0;\n    read(pipes[c][0], &part, sizeof(part));\n    close(pipes[c][0]);\n    dot += part;\n}\nfor (int c = 0; c < procs; c++) {\n    waitpid(pids[c], NULL, 0);\n}",
          "explain": "Sau khi cả procs con đã được khởi chạy song song (lưu ý: không được đặt read() hay waitpid() vào trong vòng lặp fork, nếu không các con sẽ chạy tuần tự từng đứa một chứ không song song!), cha lần lượt đọc đúng 8 byte từ từng ống pipes[c][0], đóng pipes[c][0] và cộng dồn vào dot. Cuối cùng, cha lặp procs lần gọi waitpid(pids[c], NULL, 0) thu gom sạch toàn bộ tiến trình con."
        },
        {
          "lines": "Dòng 59–63",
          "title": "In kết quả tích vô hướng và giải phóng bộ nhớ",
          "code": "printf(\"%lld\\n\", dot);\nfree(A);\nfree(B);\nreturn 0;",
          "explain": "In tích vô hướng kiểu long long với đặc tả \"%lld\\n\", giải phóng hai vùng nhớ heap A, B của tiến trình cha và kết thúc với mã 0."
        }
      ],
      "testCases": [
        {
          "name": "n không chia hết cho k (phân hoạch có dư)",
          "caseDesc": "Input: n = 10, k = 3. Ba con được chia đoạn [0,4), [4,7), [7,10).",
          "howHandled": "base = 3, rem = 1 → con 0 tính 4 phần tử, con 1 và con 2 mỗi con tính 3 phần tử, không thừa không thiếu chỉ số nào."
        },
        {
          "name": "Biên k > n (số tiến trình yêu cầu lớn hơn độ dài vector)",
          "caseDesc": "Input: n = 2, k = 8, A = [3, -4], B = [5, 2]. Tích vô hướng = 15 - 8 = 7.",
          "howHandled": "procs = min(8, 2) = 2 → chỉ sinh đúng 2 con (con 0 tính i=0, con 1 tính i=1), không tạo 6 con vô ích, in \"7\"."
        },
        {
          "name": "Vector có số âm và trực giao (tích vô hướng = 0 hoặc âm)",
          "caseDesc": "Input: n = 4, k = 2, A = [1, -2, 3, -4], B = [4, 2, 0, 0] → 4 - 4 + 0 + 0 = 0.",
          "howHandled": "Mọi phép nhân có dấu trên long long giữ chính xác dấu âm/dương, tổng cục bộ triệt tiêu ra \"0\"."
        },
        {
          "name": "Biên tối đa gây tràn int (n = 10^5, k = 8, A_i = B_i = 10^4)",
          "caseDesc": "Mỗi phần tử A_i * B_i = 10^8; tổng 10^5 phần tử = 10^13 (vượt xa 2.14 × 10^9 của kiểu int).",
          "howHandled": "part và dot đều kiểu long long, 8 tiến trình con mỗi con tính 12500 phần tử song song rồi gửi 8 byte qua ống riêng, in chính xác \"10000000000000\"."
        }
      ],
      "examRecipe": [
        "Header: <stdio.h>, <stdlib.h>, <unistd.h>, <sys/wait.h>.",
        "Đọc n, k và malloc + đọc toàn bộ hai mảng A, B TRƯỚC fork().",
        "Tính procs = (k < n) ? k : n; base = n / procs; rem = n % procs; khai báo pipes[8][2], pids[8].",
        "Vòng for c = 0..procs-1: pipe(pipes[c]) → tính L = c*base + (c<rem?c:rem), R = L + base + (c<rem?1:0) → fork().",
        "Nhánh con: đóng pipes[c][0] và các pipes[0..c-1][0] → tính long long part trên [L, R) → write(pipes[c][1], &part, sizeof(part)) → close(pipes[c][1]) → free A, B → _exit(0). Nhánh cha: lưu pids[c], close(pipes[c][1]).",
        "Ngoài vòng lặp sinh con: vòng for đọc từng pipes[c][0] cộng vào dot rồi close → vòng for waitpid(pids[c], NULL, 0) → printf(\"%lld\\n\", dot) → free A, B."
      ]
    }
  },
  {
    "num": 16,
    "id": "CR-16",
    "part": "Process",
    "partLabel": "Phần 2 · Lập trình Process trên Linux",
    "difficulty": "Khó",
    "title": "Giám sát trạng thái kết thúc của k tiến trình con",
    "staticSummary": "Kiểm tra tĩnh fork, waitpid, WIFEXITED, WEXITSTATUS, WIFSIGNALED, WTERMSIG, kill",
    "prompt": "Cho số nguyên k và mảng k mã kịch bản c_0, c_1, ..., c_{k-1}. Tiến trình cha tạo đúng k tiến trình con bằng fork(). Tại tiến trình con thứ i: nếu c_i >= 0, con tự thoát bình thường bằng _exit(c_i % 200); ngược lại nếu c_i < 0, con tự hủy bằng kill(getpid(), SIGKILL). Tiến trình cha dùng waitpid() thu gom toàn bộ k con, dùng các macro kiểm tra trạng thái để đếm số con thoát bình thường, tổng mã thoát của các con thoát bình thường, và số con bị kết thúc bởi tín hiệu SIGKILL.",
    "requirements": [
      "Sử dụng <unistd.h>, <sys/wait.h>, <signal.h>.",
      "Bắt buộc dùng fork(), waitpid(), WIFEXITED, WEXITSTATUS, WIFSIGNALED, WTERMSIG và kill().",
      "Không tính toán trực tiếp trên mảng c_i ở cha để thay thế cho việc phân tích biến status từ waitpid()."
    ],
    "inputSpec": "Dòng 1: số nguyên k. Dòng 2: k số nguyên c_0, c_1, ..., c_{k-1}.",
    "outputSpec": "Ba số nguyên trên 1 dòng: <số_con_thoát_thường> <tổng_mã_thoát> <số_con_bị_SIGKILL>.",
    "constraints": [
      "1 <= k <= 16",
      "-100 <= c_i <= 1000"
    ],
    "example": {
      "note": "c = [10, -1, 205, -2, 0]: 3 con thoát thường với mã 10, 5, 0 (tổng 15); 2 con bị hạ bởi SIGKILL.",
      "input": "5\n10 -1 205 -2 0",
      "output": "3 15 2"
    },
    "relatedTopics": [
      {
        "id": "3-5",
        "label": "3.5 Kết thúc bình thường vs Kết thúc bất thường do Tín hiệu"
      },
      {
        "id": "3-6",
        "label": "3.6 Giải mã biến status bằng WIFEXITED / WIFSIGNALED / WTERMSIG"
      },
      {
        "id": "3-7",
        "label": "3.7 Tín hiệu không thể chặn bắt SIGKILL"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Từ 16-bit trạng thái status do waitpid() ghi nhận, nhân Linux lưu cả nguyên nhân kết thúc: nếu kết thúc bình thường thì WIFEXITED(status) khác 0 và WEXITSTATUS lấy 8 bit mã thoát; nếu chết do tín hiệu thì WIFSIGNALED(status) khác 0 và WTERMSIG trả về số hiệu tín hiệu (ví dụ SIGKILL = 9).",
    "relatedQuestions": [
      "CR-09",
      "CR-14",
      "CR-49"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <signal.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    int k;\n    scanf(\"%d\", &k);\n\n    int c[20];\n    for (int i = 0; i < k; i++) scanf(\"%d\", &c[i]);\n\n    pid_t pids[20];\n    for (int i = 0; i < k; i++) {\n        pid_t pid = fork();\n        if (pid == 0) {\n            if (c[i] >= 0) {\n                _exit(c[i] % 200);\n            } else {\n                kill(getpid(), SIGKILL);\n            }\n        }\n        pids[i] = pid;\n    }\n\n    int exited_cnt = 0, exit_sum = 0, killed_cnt = 0;\n    for (int i = 0; i < k; i++) {\n        int status;\n        waitpid(pids[i], &status, 0);\n        if (WIFEXITED(status)) {\n            exited_cnt++;\n            exit_sum += WEXITSTATUS(status);\n        } else if (WIFSIGNALED(status) && WTERMSIG(status) == SIGKILL) {\n            killed_cnt++;\n        }\n    }\n\n    printf(\"%d %d %d\\n\", exited_cnt, exit_sum, killed_cnt);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Trong nhánh c[i] < 0, con tự gửi kill(getpid(), SIGKILL) nên bị nhân chấm dứt tức khắc bằng tín hiệu số 9.",
      "Tiến trình cha phân tích trung thực biến status từ waitpid() thông qua cặp WIFEXITED / WEXITSTATUS và WIFSIGNALED / WTERMSIG."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "unistd.h",
        "sys/wait.h",
        "signal.h"
      ],
      "requiredApis": [
        "fork",
        "waitpid",
        "WIFEXITED",
        "WEXITSTATUS",
        "WIFSIGNALED",
        "WTERMSIG",
        "kill",
        "SIGKILL"
      ],
      "forbiddenApis": [
        "pthread_create"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra đúng tín hiệu kết thúc WTERMSIG(status) == SIGKILL",
          "regex": "WTERMSIG\\s*\\(\\s*\\w+\\s*\\)\\s*==\\s*SIGKILL",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 3 — Giám sát và phân loại nguyên nhân kết thúc của nhiều tiến trình con với waitpid(), tín hiệu SIGKILL và bộ 4 macro WIFEXITED / WEXITSTATUS / WIFSIGNALED / WTERMSIG (Mục 3.6, 3.7).",
      "idea": {
        "summary": "Tiến trình cha nhận mảng kịch bản c[0..k-1] và sinh k tiến trình con cùng cấp. Mỗi con thứ i hành xử theo c[i]: nếu c[i] ≥ 0 thì tự thoát bình thường với mã c[i] % 200; nếu c[i] < 0 thì tự kết liễu bằng tín hiệu không thể chặn SIGKILL. Cha không được tự đếm trực tiếp trên mảng c[] mà bắt buộc dùng waitpid() thu biến status từ nhân Linux rồi giải mã bằng bộ 4 macro chuẩn POSIX để thống kê số con thoát thường, tổng mã thoát và số con chết vì SIGKILL.",
        "steps": [
          "Bước 1 — Nhập kịch bản: Cha đọc k (1 ≤ k ≤ 16) và mảng c[0..k-1] từ stdin trước khi gọi fork().",
          "Bước 2 — Vòng lặp Fan-out tạo k tiến trình con: Với mỗi i = 0..k-1, cha gọi fork() và lưu PID vào pids[i].",
          "Bước 3 — Hai kịch bản kết thúc ở tiến trình con: Nếu c[i] >= 0, con gọi _exit(c[i] % 200) (thoát bình thường với mã 8-bit trong 0..199). Ngược lại nếu c[i] < 0, con gọi kill(getpid(), SIGKILL) để tự hủy ngay lập tức bằng tín hiệu số 9.",
          "Bước 4 — Thu gom từng con bằng waitpid(): Cha chạy vòng lặp i = 0..k-1 gọi waitpid(pids[i], &status, 0) lấy biến trạng thái 32-bit status do nhân Linux điền vào.",
          "Bước 5 — Phân loại bằng bộ 4 macro và in thống kê: Kiểm tra WIFEXITED(status) để tăng exited_cnt và cộng WEXITSTATUS(status) vào exit_sum; ngược lại kiểm tra WIFSIGNALED(status) && WTERMSIG(status) == SIGKILL để tăng killed_cnt; cuối cùng in 3 số."
        ],
        "whyThisWay": "Biến int status trả về từ waitpid() là một cấu trúc mã hóa theo từng nhóm bit (bitfield): 7 bit thấp cho biết số hiệu tín hiệu gây chết (bằng 0 nếu thoát bình thường), còn 8 bit tiếp theo (bit 8..15) chứa mã thoát của _exit(). Vì vậy TUYỆT ĐỐI không được đọc trực tiếp status hay gọi WEXITSTATUS(status) khi chưa kiểm tra WIFEXITED(status) — nếu một con bị SIGKILL mà ta vẫn gọi WEXITSTATUS(status), macro sẽ đọc ra 0 và tính nhầm nó thành con thoát bình thường! Bộ 4 macro chuẩn POSIX giúp mã nguồn đúng trên mọi kiến trúc hệ điều hành.",
        "complexity": "Thời gian: O(k) · Bộ nhớ: O(k) (hai mảng tĩnh c[20], pids[20]) · Tài nguyên HĐH: k tiến trình con (k ≤ 16, được thu gom sạch qua waitpid)."
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện I/O, tín hiệu và quản lý tiến trình",
          "code": "#include <stdio.h>\n#include <signal.h>\n#include <unistd.h>\n#include <sys/wait.h>",
          "explain": "<stdio.h> cho scanf/printf; <signal.h> cung cấp hàm kill() và hằng số tín hiệu SIGKILL (giá trị 9 trên Linux); <unistd.h> cung cấp fork(), getpid(), _exit(), pid_t; <sys/wait.h> cung cấp waitpid() cùng 4 macro WIFEXITED, WEXITSTATUS, WIFSIGNALED, WTERMSIG."
        },
        {
          "lines": "Dòng 6–11",
          "title": "Nhập số lượng k và mảng kịch bản c[0..k-1]",
          "code": "int k;\nscanf(\"%d\", &k);\n\nint c[20];\nfor (int i = 0; i < k; i++) scanf(\"%d\", &c[i]);",
          "explain": "Đề bài giới hạn 1 ≤ k ≤ 16 nên mảng tĩnh int c[20] đủ rộng và gọn nhẹ, không cần malloc/free. Nhập toàn bộ mảng c[] trước khi fork() giúp mọi tiến trình con sinh ra đều đọc được chính xác kịch bản c[i] của riêng mình."
        },
        {
          "lines": "Dòng 13–24",
          "title": "Vòng lặp Fan-out sinh k con chạy 2 kịch bản _exit() và SIGKILL",
          "code": "pid_t pids[20];\nfor (int i = 0; i < k; i++) {\n    pid_t pid = fork();\n    if (pid == 0) {\n        if (c[i] >= 0) {\n            _exit(c[i] % 200);\n        } else {\n            kill(getpid(), SIGKILL);\n        }\n    }\n    pids[i] = pid;\n}",
          "explain": "Với mỗi i = 0..k-1, cha tạo 1 con và lưu pids[i] = pid. Trong nhánh con (pid == 0): nếu c[i] >= 0 (lưu ý 0 vẫn là thoát bình thường!), con gọi _exit(c[i] % 200) — lấy % 200 để ép giá trị c[i] ≤ 1000 vào đúng dải 0..199 nằm gọn trong 8-bit exit code. Nếu c[i] < 0, con lấy PID của chính mình qua getpid() rồi gọi kill(getpid(), SIGKILL): tín hiệu SIGKILL do nhân Linux xử lý cưỡng bức, không thể bị bắt hay bỏ qua, tiêu diệt tiến trình con ngay lập tức nên con KHÔNG BAO GIỜ thoát khỏi khối if để chạy tiếp vòng for tạo tiến trình cháu."
        },
        {
          "lines": "Dòng 26–29",
          "title": "Khởi tạo 3 bộ đếm và chờ thu gom từng con bằng waitpid()",
          "code": "int exited_cnt = 0, exit_sum = 0, killed_cnt = 0;\nfor (int i = 0; i < k; i++) {\n    int status;\n    waitpid(pids[i], &status, 0);",
          "explain": "Ba biến đếm được khởi tạo về 0. Vòng lặp chạy đúng k lần gọi waitpid(pids[i], &status, 0) để chặn chờ lần lượt từng tiến trình con và thu về mã trạng thái đóng gói status. Vòng lặp này đồng thời đảm bảo cả k tiến trình con (dù thoát thường hay bị SIGKILL) đều được thu gom hoàn toàn, không còn bất kỳ Zombie nào."
        },
        {
          "lines": "Dòng 30–36",
          "title": "Giải mã bitfield status bằng bộ 4 macro chuẩn POSIX",
          "code": "    if (WIFEXITED(status)) {\n        exited_cnt++;\n        exit_sum += WEXITSTATUS(status);\n    } else if (WIFSIGNALED(status) && WTERMSIG(status) == SIGKILL) {\n        killed_cnt++;\n    }\n}",
          "explain": "Đây là trọng tâm lý thuyết của Chương 3: (1) WIFEXITED(status) (\"Wait IF EXITED\") trả về đúng nếu con kết thúc bình thường qua _exit/exit/return; CHỈ KHI đó mới được gọi WEXITSTATUS(status) để tách 8 bit mã thoát và cộng vào exit_sum. (2) Nếu không thoát thường, kiểm tra tiếp WIFSIGNALED(status) (\"Wait IF SIGNALED\") xem con có bị tiêu diệt bởi tín hiệu hay không; CHỈ KHI đúng mới gọi WTERMSIG(status) (\"Wait TERMinating SIGnal\") để lấy số hiệu tín hiệu kết liễu và so sánh == SIGKILL. Cấu trúc if / else if đảm bảo hai trường hợp hoàn toàn loại trừ nhau, không bao giờ đếm trùng."
        },
        {
          "lines": "Dòng 38–40",
          "title": "In bộ 3 thống kê và kết thúc chương trình",
          "code": "printf(\"%d %d %d\\n\", exited_cnt, exit_sum, killed_cnt);\nreturn 0;",
          "explain": "In đúng 3 số nguyên cách nhau bởi 1 dấu cách theo đúng thứ tự đề yêu cầu: <số_con_thoát_thường> <tổng_mã_thoát> <số_con_bị_SIGKILL>, rồi trả về 0."
        }
      ],
      "testCases": [
        {
          "name": "Hỗn hợp thoát thường, biên 0, vượt 200 và SIGKILL",
          "caseDesc": "Input: k = 5, c = [10, -1, 205, -2, 0]. Mã thoát hợp lệ: 10, 205 % 200 = 5, 0 → 3 con, tổng 15; 2 con bị SIGKILL.",
          "howHandled": "WIFEXITED bắt đúng 3 con (tổng WEXITSTATUS = 10 + 5 + 0 = 15); WIFSIGNALED && WTERMSIG == SIGKILL bắt đúng 2 con → in \"3 15 2\"."
        },
        {
          "name": "Tất cả tiến trình con đều bị SIGKILL",
          "caseDesc": "Input: k = 4, c = [-1, -50, -100, -9]. Không có con nào thoát bình thường.",
          "howHandled": "WIFEXITED luôn sai nên exited_cnt = 0, exit_sum = 0; tất cả 4 con lọt vào nhánh SIGKILL → in \"0 0 4\"."
        },
        {
          "name": "Tất cả thoát bình thường và chia hết cho 200 (bẫy 8-bit)",
          "caseDesc": "Input: k = 3, c = [200, 400, 1000]. Cả 3 đều >= 0 và có c[i] % 200 == 0.",
          "howHandled": "Cả 3 gọi _exit(0), WIFEXITED đúng 3 lần với WEXITSTATUS = 0, killed_cnt = 0 → in \"3 0 0\"."
        },
        {
          "name": "Biên tối đa k = 16 tiến trình con xen kẽ",
          "caseDesc": "k = 16 với 8 số dương (199) và 8 số âm (-1). Tổng mã thoát = 8 × 199 = 1592.",
          "howHandled": "Mảng c[20] và pids[20] chứa đủ 16 phần tử, cả 16 con được waitpid() thu gom không để Zombie, in \"8 1592 8\"."
        }
      ],
      "examRecipe": [
        "Header: <stdio.h>, <signal.h>, <unistd.h>, <sys/wait.h>.",
        "Đọc k và mảng c[20] TRƯỚC khi gọi fork().",
        "Vòng for i = 0..k-1 gọi fork(): trong nhánh con (pid == 0), nếu c[i] >= 0 gọi _exit(c[i] % 200), ngược lại gọi kill(getpid(), SIGKILL). Ở cha lưu pids[i] = pid.",
        "Vòng for i = 0..k-1 gọi waitpid(pids[i], &status, 0).",
        "Dùng đúng cặp if (WIFEXITED(status)) { exited_cnt++; exit_sum += WEXITSTATUS(status); } else if (WIFSIGNALED(status) && WTERMSIG(status) == SIGKILL) { killed_cnt++; }.",
        "In printf(\"%d %d %d\\n\", exited_cnt, exit_sum, killed_cnt);."
      ]
    }
  }
];
