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
      "origin": "Chương 3 — Tạo tiến trình bằng fork() và nhận mã thoát 8-bit qua waitpid() (Mục 3.3, 3.5, 3.6 · Lab 3 Bài 1, 3).",
      "lineByLine": [
        {
          "lines": "Dòng 10–16",
          "code": "if (pid == 0) { ... _exit((int)sum); }",
          "explain": "Tiến trình con tính tổng từ a đến b theo modulo 200 (đảm bảo nằm trong 0..199, không vượt 8-bit 0..255 của exit code) rồi trả kết quả bằng _exit(). Con không in gì ra stdout."
        },
        {
          "lines": "Dòng 18–22",
          "code": "waitpid(pid, &status, 0); if (WIFEXITED(status)) printf(\"%d\\n\", WEXITSTATUS(status));",
          "explain": "Cha chặn chờ con kết thúc, kiểm tra con thoát bình thường bằng WIFEXITED(status) và trích đúng 8 bit mã thoát bằng WEXITSTATUS(status)."
        }
      ],
      "testCases": [
        {
          "name": "Đoạn chuẩn 1..25",
          "caseDesc": "1 25 → tổng 325 % 200 = 125",
          "howHandled": "Con thoát _exit(125), cha in 125."
        },
        {
          "name": "a == b == 0",
          "caseDesc": "0 0",
          "howHandled": "sum = 0, _exit(0), cha in 0."
        },
        {
          "name": "Đoạn lớn 0..10^6",
          "caseDesc": "Tổng ~5 * 10^11 vượt int",
          "howHandled": "Lấy % 200 ngay trong vòng lặp với biến long long nên không bao giờ tràn."
        }
      ],
      "examRecipe": [
        "Header: <unistd.h>, <sys/wait.h>, <stdlib.h>.",
        "Đọc a, b → fork().",
        "Nhánh pid == 0: tính sum = (sum + i) % 200 rồi _exit((int)sum).",
        "Nhánh cha: waitpid(pid, &status, 0) → if (WIFEXITED(status)) in WEXITSTATUS(status)."
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
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    int *a = (int *)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n\n    int p[2];\n    pipe(p);\n\n    pid_t pid = fork();\n    if (pid == 0) {\n        close(p[1]);\n        long long sum = 0;\n        int x;\n        for (int i = 0; i < n; i++) {\n            read(p[0], &x, sizeof(x));\n            sum += x;\n        }\n        close(p[0]);\n        printf(\"%lld\\n\", sum);\n        free(a);\n        _exit(0);\n    } else {\n        close(p[0]);\n        for (int i = 0; i < n; i++) {\n            write(p[1], &a[i], sizeof(a[i]));\n        }\n        close(p[1]);\n        waitpid(pid, NULL, 0);\n        free(a);\n    }\n    return 0;\n}\n",
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
      "origin": "Chương 3 — Đường ống ẩn danh một chiều pipe() giữa Cha và Con (Mục 3.8 · Slide APT03).",
      "lineByLine": [
        {
          "lines": "Dòng 12–13",
          "code": "int p[2]; pipe(p);",
          "explain": "Bắt buộc tạo pipe(p) TRƯỚC khi gọi fork() để cả cha và con đều sở hữu chung p[0] (đầu đọc) và p[1] (đầu ghi)."
        },
        {
          "lines": "Dòng 16–26",
          "code": "Nhánh con (pid == 0): close(p[1]); đọc từng số từ p[0];",
          "explain": "Con chỉ đọc nên đóng ngay đầu ghi p[1], đọc lần lượt n số nguyên từ p[0], cộng dồn vào long long sum, đóng p[0] và in kết quả."
        },
        {
          "lines": "Dòng 28–35",
          "code": "Nhánh cha: close(p[0]); ghi từng phần tử vào p[1]; close(p[1]); waitpid(...);",
          "explain": "Cha đóng đầu đọc p[0], ghi lần lượt n phần tử sang p[1], đóng đầu ghi p[1] để báo kết thúc rồi chờ con bằng waitpid()."
        }
      ],
      "testCases": [
        {
          "name": "Mảng có số âm và dương",
          "caseDesc": "5 / 10 -3 7 8 12",
          "howHandled": "Cha gửi đúng 5 số nguyên, con cộng ra 34."
        },
        {
          "name": "Mảng lớn n = 10^4, giá trị ±10^6",
          "caseDesc": "Tổng tối đa 10^10 > int",
          "howHandled": "Gửi từng int 4 byte (nhỏ hơn PIPE_BUF 4096 nên không bao giờ bị chia mảnh khi đọc/ghi pipe) và cộng vào long long sum."
        }
      ],
      "examRecipe": [
        "Đọc n và mảng a[] ở cha → tạo pipe(p) → gọi fork().",
        "Con: close(p[1]) → lặp n lần read(p[0], &x, sizeof(x)) tính long long sum → close(p[0]) → in sum → _exit(0).",
        "Cha: close(p[0]) → lặp n lần write(p[1], &a[i], sizeof(a[i])) → close(p[1]) → waitpid()."
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
      "origin": "Chương 3 — Mô hình Fan-out sinh đúng k tiến trình con cùng cấp và thu gom không để zombie (Mục 3.3, 3.6, 3.8).",
      "lineByLine": [
        {
          "lines": "Dòng 13–23",
          "code": "for (int i = 1; i <= k; i++) { fork(); if (pid == 0) { ... _exit(0); } }",
          "explain": "CỰC KỲ QUAN TRỌNG: Mỗi tiến trình con tính i^3, ghi 8 byte (nhỏ hơn PIPE_BUF nên nguyên tử không bị trộn byte giữa các con) vào p[1] rồi gọi ngay _exit(0) để KHÔNG tiếp tục vòng for sinh thêm tiến trình cháu!"
        },
        {
          "lines": "Dòng 25–31",
          "code": "close(p[1]); đọc đủ k giá trị long long từ p[0]",
          "explain": "Cha đóng đầu ghi p[1], đọc đúng k số long long từ p[0] và cộng dồn."
        },
        {
          "lines": "Dòng 33–35",
          "code": "for (int i = 1; i <= k; i++) waitpid(pids[i], NULL, 0);",
          "explain": "Thu gom toàn bộ k tiến trình con, không để lại bất kỳ zombie nào."
        }
      ],
      "testCases": [
        {
          "name": "k = 4",
          "caseDesc": "1^3 + 2^3 + 3^3 + 4^3",
          "howHandled": "1 + 8 + 27 + 64 = 100."
        },
        {
          "name": "k = 1",
          "caseDesc": "1 tiến trình con duy nhất",
          "howHandled": "In 1."
        },
        {
          "name": "k = 16 (giới hạn trên)",
          "caseDesc": "16 con ghi đồng thời vào 1 pipe",
          "howHandled": "Mỗi con chỉ ghi 8 byte (<= PIPE_BUF 4096 byte) nên POSIX đảm bảo nguyên tử, không trộn byte."
        }
      ],
      "examRecipe": [
        "Tạo pipe(p) trước vòng lặp for i = 1..k.",
        "Trong vòng lặp gọi fork(): nhánh con đóng p[0], tính long long cube = i*i*i, ghi p[1], đóng p[1], và PHẢI _exit(0) ngay!",
        "Cha đóng p[1], đọc đủ k số từ p[0], đóng p[0], gọi waitpid() cho cả k con và in tổng."
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
      "origin": "Chương 3 — Giao tiếp 2 chiều Cha ↔ Con bằng 2 ống pipe (Mục 3.8 · Lab 3 Bài 5 · Đề thi thật Câu 22). Code bám sát 100% mẫu cực dễ nhớ bạn đã làm ở Đề_mẫu!",
      "lineByLine": [
        {
          "lines": "Dòng 6–12",
          "code": "int is_prime(int x)",
          "explain": "Kiểm tra số nguyên tố trong O(sqrt(x)); số <= 1 (gồm âm, 0, 1) lập tức trả về 0. Dùng (long long)i * i tránh tràn khi x tới 10^6."
        },
        {
          "lines": "Dòng 15–17",
          "code": "int p1[2], p2[2]; pipe(p1); pipe(p2);",
          "explain": "Tạo 2 ống riêng: p1 truyền chiều Cha → Con, p2 truyền chiều Con → Cha."
        },
        {
          "lines": "Dòng 20–35",
          "code": "Con: close(p1[1]); close(p2[0]); đọc từ p1[0] → gửi sum qua p2[1]",
          "explain": "Con đóng đầu không dùng, đọc n rồi đọc từng phần tử từ p1[0], cộng các số nguyên tố rồi gửi long long sum ngược lại qua p2[1]."
        },
        {
          "lines": "Dòng 37–57",
          "code": "Cha: close(p1[0]); close(p2[1]); ghi p1[1] → đọc p2[0] → waitpid",
          "explain": "Cha đọc stdin, gửi n và mảng sang con qua p1[1], đóng p1[1], nhận kết quả từ p2[0], đợi con bằng waitpid rồi in tổng."
        }
      ],
      "testCases": [
        {
          "name": "Có số âm, 0, 1, hợp số và nguyên tố",
          "caseDesc": "7 / 1 2 4 7 11 -5 9",
          "howHandled": "is_prime loại 1, 4, -5, 9; giữ 2 + 7 + 11 = 20."
        },
        {
          "name": "Không có số nguyên tố nào",
          "caseDesc": "3 / -10 0 1",
          "howHandled": "sum giữ nguyên 0 → in 0."
        },
        {
          "name": "Mảng lớn n = 10^4",
          "caseDesc": "Gửi 10^4 số qua pipe",
          "howHandled": "Cha và con chạy đồng thời (con đọc liên tục trong lúc cha ghi) nên không bị đầy bộ đệm pipe 64KB."
        }
      ],
      "examRecipe": [
        "Viết hàm is_prime(x) loại x <= 1.",
        "Tạo 2 ống pipe(p1) (Cha→Con) và pipe(p2) (Con→Cha) TRƯỚC fork().",
        "Con đóng p1[1], p2[0] → đọc n và n số từ p1[0] → gửi sum vào p2[1] → đóng hết → _exit(0).",
        "Cha đóng p1[0], p2[1] → ghi n và n số vào p1[1] → đóng p1[1] → đọc sum từ p2[0] → waitpid → in sum."
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
      "origin": "Chương 3 — Chuyển hướng STDIN/STDOUT bằng dup2() và nạp tiện ích Linux qua execlp() (Mục 3.4, 3.8 · Lab 3 Bài 6 · Slide APT03).",
      "lineByLine": [
        {
          "lines": "Dòng 7–9",
          "code": "int p_in[2], p_out[2]; pipe(p_in); pipe(p_out);",
          "explain": "p_in đưa văn bản từ Cha vào STDIN của wc; p_out đưa kết quả từ STDOUT của wc về lại Cha."
        },
        {
          "lines": "Dòng 16–21",
          "code": "dup2(p_in[0], STDIN_FILENO); dup2(p_out[1], STDOUT_FILENO); execlp(\"wc\", \"wc\", \"-w\", NULL);",
          "explain": "Nối 2 đầu chuẩn của con vào 2 đường ống rồi đóng bản sao dư, sau đó gọi execlp chạy lệnh hệ thống wc -w."
        },
        {
          "lines": "Dòng 29–37",
          "code": "Đọc từ STDIN_FILENO ghi vào p_in[1] rồi close(p_in[1])",
          "explain": "CỰC QUAN TRỌNG: Sau khi đẩy hết văn bản sang con, cha PHẢI đóng p_in[1] để wc nhận EOF mới chịu in kết quả và thoát!"
        },
        {
          "lines": "Dòng 39–50",
          "code": "Đọc chuỗi kết quả từ p_out[0], dùng sscanf lấy số nguyên sạch",
          "explain": "wc -w có thể in kèm khoảng trắng đầu/cuối dòng; dùng sscanf(out, \"%lld\", &words) lọc ra đúng 1 số nguyên duy nhất."
        }
      ],
      "testCases": [
        {
          "name": "Văn bản nhiều dòng, nhiều dấu cách thừa",
          "caseDesc": "\"Advanced   Programming\\nTechniques Linux   Process\"",
          "howHandled": "wc -w tự xử lý chuẩn khoảng trắng/xuống dòng → in 5."
        },
        {
          "name": "Đầu vào rỗng 0 byte",
          "caseDesc": "EOF ngay lập tức",
          "howHandled": "Cha đóng p_in[1] ngay, wc -w in \"0\\n\" → in 0."
        },
        {
          "name": "Văn bản lớn tới 64 KB",
          "caseDesc": "65536 byte",
          "howHandled": "Đọc/ghi theo khối 4 KB qua p_in, không tràn buffer tĩnh."
        }
      ],
      "examRecipe": [
        "Tạo 2 pipe: p_in (cấp stdin cho wc) và p_out (nhận stdout của wc) trước fork().",
        "Con: dup2(p_in[0], STDIN_FILENO), dup2(p_out[1], STDOUT_FILENO), đóng 4 đầu pipe thừa, gọi execlp(\"wc\", \"wc\", \"-w\", NULL).",
        "Cha: đọc STDIN ghi vào p_in[1] rồi NHỚ close(p_in[1]) để wc thấy EOF.",
        "Cha đọc kết quả từ p_out[0], waitpid(), dùng sscanf lọc số nguyên và in."
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
      "origin": "Chương 3 — Tín hiệu POSIX, sigaction(), kill() và bắt tay chống mất tín hiệu bằng sigsuspend() (Mục 3.7 · Slide APT03).",
      "lineByLine": [
        {
          "lines": "Dòng 7–9",
          "code": "volatile sig_atomic_t parent_count, got_usr1, got_ack;",
          "explain": "Biến chia sẻ giữa main() và signal handler BẮT BUỘC là volatile sig_atomic_t để tránh tối ưu thanh ghi và đảm bảo đọc/ghi nguyên tử."
        },
        {
          "lines": "Dòng 26–36",
          "code": "sigprocmask(SIG_BLOCK, &mask, &oldmask); sigaction(...);",
          "explain": "Chặn tạm SIGUSR1/SIGUSR2 và cài đặt 2 handler TRƯỚC khi gọi fork(). Nhờ đó tuyệt đối không xảy ra race condition gửi tín hiệu trước khi kịp chờ."
        },
        {
          "lines": "Dòng 40–46",
          "code": "Con: kill(getppid(), SIGUSR1) → while (!got_ack) sigsuspend(&oldmask)",
          "explain": "Con gửi SIGUSR1 cho cha rồi dùng sigsuspend(&oldmask) tạm mở khóa tín hiệu và ngủ nguyên tử chờ cha gửi lại SIGUSR2 xác nhận."
        },
        {
          "lines": "Dòng 49–56",
          "code": "Cha: while (!got_usr1) sigsuspend(&oldmask) → kill(pid, SIGUSR2)",
          "explain": "Cha ngủ chờ SIGUSR1, khi nhận thì đặt lại cờ got_usr1 = 0 rồi gửi SIGUSR2 báo con gửi nhịp tiếp theo. Xong m lần thì waitpid() và in parent_count."
        }
      ],
      "testCases": [
        {
          "name": "m = 12 hoặc m = 500",
          "caseDesc": "Gửi liên tiếp 500 tín hiệu chuẩn",
          "howHandled": "Cơ chế bắt tay 1-1 đảm bảo không bị gộp/mất bất kỳ SIGUSR1 nào và không cần sleep()."
        },
        {
          "name": "m = 0",
          "caseDesc": "Không gửi tín hiệu nào",
          "howHandled": "Vòng for 0 lần ở cả cha và con, waitpid() thu dọn con, in 0."
        }
      ],
      "examRecipe": [
        "Thêm #define _POSIX_C_SOURCE 200809L ở dòng đầu tiên khi dùng sigaction/sigsuspend với -std=c11.",
        "Khai báo 3 cờ volatile sig_atomic_t và 2 handler ngắn cho SIGUSR1, SIGUSR2.",
        "Trước fork(): sigprocmask(SIG_BLOCK) chặn SIGUSR1/2 rồi cài sigaction cho cả hai.",
        "Con: lặp m lần [gửi SIGUSR1 cho getppid() → chờ got_ack bằng sigsuspend(&oldmask)].",
        "Cha: lặp m lần [chờ got_usr1 bằng sigsuspend(&oldmask) → gửi SIGUSR2 cho pid] → waitpid → in parent_count."
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
      "origin": "Chương 3 + Chương 5 — Tính song song bằng k tiến trình con với mảng pipe riêng và phân hoạch tĩnh (Mục 3.8, 5.4).",
      "lineByLine": [
        {
          "lines": "Dòng 15–20",
          "code": "int procs = (k < n) ? k : n; base = n / procs; rem = n % procs;",
          "explain": "Chỉ tạo tối đa min(n, k) tiến trình con. Công thức chia phần dư rem cho rem con đầu giúp mỗi con nhận đoạn liên tiếp [L, R) cân bằng nhất."
        },
        {
          "lines": "Dòng 23–40",
          "code": "pipe(pipes[c]); fork(); nhánh con đóng đầu thừa và ghi part",
          "explain": "Mỗi con có ống pipes[c] riêng biệt nên tuyệt đối không trộn byte. Con tính tổng tích bằng (long long)A[i] * B[i] rồi gửi về cha và _exit(0)."
        },
        {
          "lines": "Dòng 47–57",
          "code": "Cha đọc từ từng pipes[c][0] và gọi waitpid() cho mọi con",
          "explain": "Cha đọc đủ kết quả từng con, đóng ống, thu gom đủ procs tiến trình con rồi in tổng tích vô hướng."
        }
      ],
      "testCases": [
        {
          "name": "n không chia hết cho k",
          "caseDesc": "n = 5, k = 3",
          "howHandled": "base=1, rem=2 → 3 con xử lý [0,2), [2,4), [4,5): đủ 5 phần tử, không thiếu/trùng."
        },
        {
          "name": "k > n",
          "caseDesc": "n = 2, k = 8",
          "howHandled": "procs = min(2, 8) = 2, không sinh tiến trình thừa."
        },
        {
          "name": "Tràn int khi n = 10^5, A_i = B_i = 10^4",
          "caseDesc": "Tích tối đa 10^13",
          "howHandled": "Ép (long long)A[i] * B[i] và cộng bằng long long."
        }
      ],
      "examRecipe": [
        "Đọc A, B → tính procs = min(n, k), base = n / procs, rem = n % procs.",
        "Trong vòng c = 0..procs-1: tạo pipe(pipes[c]), tính đoạn [L, R), gọi fork().",
        "Con: đóng đầu đọc, tính long long part = sum A[i]*B[i], ghi pipes[c][1], _exit(0).",
        "Cha đóng ngay pipes[c][1]; sau vòng for đọc từng pipes[c][0], gọi waitpid() hết và in tổng."
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
      "origin": "Chương 3 — Giám sát trạng thái kết thúc của tiến trình con với waitpid() và bộ 4 macro WIFEXITED/WEXITSTATUS/WIFSIGNALED/WTERMSIG (Mục 3.6, 3.7).",
      "lineByLine": [
        {
          "lines": "Dòng 14–24",
          "code": "if (c[i] >= 0) _exit(c[i] % 200); else kill(getpid(), SIGKILL);",
          "explain": "Tạo k con cùng cấp: kịch bản không âm tự thoát bình thường với mã c[i] % 200; kịch bản âm tự gửi SIGKILL kết liễu chính mình."
        },
        {
          "lines": "Dòng 29–35",
          "code": "WIFEXITED(status) / WEXITSTATUS(status) và WIFSIGNALED(status) / WTERMSIG(status)",
          "explain": "Cha đọc status thật từ nhân qua waitpid(): nếu thoát bình thường thì tăng exited_cnt và cộng WEXITSTATUS; nếu bị giết bởi SIGKILL thì tăng killed_cnt."
        }
      ],
      "testCases": [
        {
          "name": "Hỗn hợp thoát thường + SIGKILL + modulo 200",
          "caseDesc": "5 / 10 -1 205 -2 0",
          "howHandled": "10→10, 205%200→5, 0→0 (3 con, tổng 15); -1 và -2 tự SIGKILL (2 con) → in \"3 15 2\"."
        },
        {
          "name": "Tất cả cùng SIGKILL hoặc cùng thoát thường",
          "caseDesc": "Toàn số âm hoặc toàn số dương",
          "howHandled": "Từng bộ đếm tương ứng bằng 0 không bị lỗi."
        }
      ],
      "examRecipe": [
        "Header: <unistd.h>, <sys/wait.h>, <signal.h>.",
        "Vòng for 0..k-1 gọi fork(): nhánh con nếu c[i] >= 0 thì _exit(c[i] % 200), ngược lại kill(getpid(), SIGKILL).",
        "Cha gọi waitpid(pids[i], &status, 0) cho từng con rồi phân loại bằng WIFEXITED / WEXITSTATUS và WIFSIGNALED / WTERMSIG == SIGKILL.",
        "In 3 số: exited_cnt exit_sum killed_cnt."
      ]
    }
  }
];
