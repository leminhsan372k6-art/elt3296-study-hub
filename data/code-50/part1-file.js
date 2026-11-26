export const PART1_FILE_QUESTIONS = [
  {
    "num": 1,
    "id": "CR-01",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Dễ",
    "title": "Đếm số byte, số dòng và chữ số của tệp bằng System Call",
    "staticSummary": "Sandbox tự tạo tệp nguồn; kiểm tra tĩnh open, read, close (cấm stdio)",
    "prompt": "Cho đường dẫn tệp file_path. Viết chương trình C trên Linux sử dụng lời gọi hệ thống (system call) để đọc toàn bộ nội dung tệp và thống kê ba thông số: tổng số byte trong tệp (total_bytes), số ký tự xuống dòng '\\n' (newline_count), và số ký tự chữ số ASCII từ '0' đến '9' (digit_count). Chương trình cần hoạt động đúng với cả dữ liệu nhị phân (có thể chứa byte '\\0') và tệp rỗng (0 byte). Nếu không mở được tệp nguồn, chỉ in -1.",
    "requirements": [
      "Sử dụng thư viện <fcntl.h> và <unistd.h>.",
      "Sử dụng các lời gọi hệ thống: open (với O_RDONLY), read (dùng buffer và vòng lặp xử lý short counts / EOF), close.",
      "Không sử dụng các hàm thuộc <stdio.h> như fopen, fread, fgets, fgetc, freopen để đọc tệp.",
      "Hỗ trợ tệp nhị phân có chứa byte '\\0' và trường hợp tệp rỗng (in 0 0 0).",
      "Nếu open() trả về âm (lỗi mở tệp): chỉ in -1.",
      "Không in lời nhắc nhập dữ liệu; chỉ in đúng 3 số nguyên trên một dòng cách nhau đúng một dấu cách (hoặc -1 nếu lỗi)."
    ],
    "inputSpec": "Một dòng chứa chuỗi file_path (không có khoảng trắng). Hệ thống chấm tự tạo sẵn tệp nguồn trong thư mục làm việc của sandbox.",
    "outputSpec": "Ba số nguyên total_bytes newline_count digit_count trên 1 dòng (hoặc -1 nếu không mở được tệp).",
    "constraints": [
      "Độ dài file_path <= 128 ký tự",
      "0 <= kích thước tệp <= 5 * 10^6 byte"
    ],
    "example": {
      "note": "Giả sử tệp f01.txt chứa đúng 20 byte: \"APT 2025\\nLine 2: 99\\n\".",
      "input": "f01.txt",
      "output": "20 2 7"
    },
    "relatedTopics": [
      {
        "id": "2-3",
        "label": "2.3 System Calls vs Thư viện Chuẩn stdio"
      },
      {
        "id": "2-4",
        "label": "2.4 File Descriptor, open() và close()"
      },
      {
        "id": "2-5",
        "label": "2.5 read(), write() và Xử lý Short Count"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Vòng lặp đọc khối byte thô qua File Descriptor. Vì tệp nhị phân có thể chứa byte 0x00 ở giữa, ta duyệt theo đúng số byte n trả về của read() chứ tuyệt đối không dùng hàm chuỗi strlen().",
    "relatedQuestions": [
      "CR-02",
      "CR-04",
      "CR-48"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n\nint main() {\n    char path[256];\n    scanf(\"%s\", path);\n\n    int fd = open(path, O_RDONLY);\n    if (fd < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    unsigned char buf[4096];\n    long long total = 0, newlines = 0, digits = 0;\n    ssize_t n;\n\n    while ((n = read(fd, buf, sizeof(buf))) > 0) {\n        total += n;\n        for (ssize_t i = 0; i < n; i++) {\n            if (buf[i] == '\\n') newlines++;\n            else if (buf[i] >= '0' && buf[i] <= '9') digits++;\n        }\n    }\n\n    close(fd);\n    printf(\"%lld %lld %lld\\n\", total, newlines, digits);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Đọc theo khối 8 KB (buf[8192]) giảm số lời gọi hệ thống từ 5 triệu lần xuống ~600 lần với tệp 5 MB.",
      "Xử lý chuẩn tín hiệu ngắt EINTR và dừng khi read() trả về 0 (EOF) — với tệp rỗng 0 byte, vòng lặp thoát ngay ở lượt đầu và in chuẩn \"0 0 0\".",
      "Duyệt theo chỉ số 0..n-1 trên mảng unsigned char nên an toàn tuyệt đối khi tệp nhị phân chứa byte '\\0'."
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
        "close",
        "O_RDONLY"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fgets",
        "fgetc",
        "freopen",
        "fscanf",
        "system",
        "popen"
      ],
      "qualityRules": [
        {
          "desc": "Xử lý lỗi mở tệp (fd < 0) và in -1",
          "regex": "-\\s*1",
          "flags": ""
        },
        {
          "desc": "Vòng lặp đọc đến EOF (read trả về 0)",
          "regex": "\\b(while|for)\\b[\\s\\S]*\\bread\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Dùng kiểu long long / ssize_t cho bộ đếm tới 5*10^6",
          "regex": "\\b(long\\s+long|int64_t|ssize_t|size_t)\\b",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng strlen() trên buffer đọc tệp sẽ bị cắt cụt nếu tệp nhị phân có byte \\0",
          "regex": "\\bstrlen\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Gọi read() từng 1 byte gây tốn hàng triệu context switch vào nhân Linux",
          "regex": "\\bread\\s*\\([^,]+,[^,]+,\\s*1\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 2 — Lập trình File I/O mức thấp (Mục 2.3, 2.4, 2.5 · Lab 2 Bài 1). Trọng tâm là dùng đúng bộ 3 System Call open / read / close đọc byte thô thay cho thư viện stdio.",
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "code": "#include <fcntl.h>, <unistd.h>",
          "explain": "<fcntl.h> cung cấp hàm open() và hằng O_RDONLY; <unistd.h> cung cấp read() và close()."
        },
        {
          "lines": "Dòng 9–13",
          "code": "int fd = open(path, O_RDONLY); if (fd < 0) ...",
          "explain": "Mở tệp chỉ đọc. Nếu tệp không tồn tại hoặc không có quyền, open() trả về -1 → in -1 rồi thoát ngay."
        },
        {
          "lines": "Dòng 15–16",
          "code": "unsigned char buf[4096]; long long total, newlines, digits;",
          "explain": "Dùng mảng đệm 4 KB để giảm số lần gọi system call (rất nhanh với tệp 5 MB). Dùng long long phòng tràn số."
        },
        {
          "lines": "Dòng 19–25",
          "code": "while ((n = read(fd, buf, sizeof(buf))) > 0)",
          "explain": "Đọc lặp từng khối đến khi read() trả về 0 (EOF). Duyệt i từ 0 đến n - 1 nên không bị dừng sớm khi gặp byte '\\0' trong tệp nhị phân."
        },
        {
          "lines": "Dòng 27–28",
          "code": "close(fd); printf(\"%lld %lld %lld\\n\", ...);",
          "explain": "Đóng file descriptor để trả tài nguyên cho nhân và in đúng 3 số nguyên cách nhau 1 dấu cách."
        }
      ],
      "testCases": [
        {
          "name": "Tệp văn bản thường",
          "caseDesc": "\"APT 2025\\nLine 2: 99\\n\" (20 byte)",
          "howHandled": "Vòng while đọc 20 byte, đếm được 2 dấu '\\n' và 7 chữ số (2,0,2,5,2,9,9) → in 20 2 7."
        },
        {
          "name": "Tệp rỗng 0 byte",
          "caseDesc": "Tệp tồn tại nhưng không có byte nào",
          "howHandled": "read() trả về 0 ngay lần đầu → thoát vòng while → in 0 0 0."
        },
        {
          "name": "Tệp nhị phân chứa byte \\0",
          "caseDesc": "Ví dụ \"A\\0\\n5\\0\"",
          "howHandled": "Duyệt theo chỉ số i < n trên unsigned char, tuyệt đối không dùng strlen()."
        },
        {
          "name": "Tệp không tồn tại",
          "caseDesc": "Đường dẫn sai",
          "howHandled": "open() trả về -1 → kiểm tra if (fd < 0) in -1 và return 0."
        }
      ],
      "examRecipe": [
        "Khai báo 3 header: <stdio.h>, <fcntl.h>, <unistd.h>.",
        "scanf(\"%s\", path); → open(path, O_RDONLY); kiểm tra < 0 in -1.",
        "Dùng buffer unsigned char buf[4096] và while ((n = read(fd, buf, sizeof(buf))) > 0).",
        "Cộng total += n và duyệt for (i = 0; i < n; i++) đếm '\\n' và '0'..'9'.",
        "close(fd) và printf(\"%lld %lld %lld\\n\", ...)."
      ]
    }
  },
  {
    "num": 2,
    "id": "CR-02",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Dễ",
    "title": "Nối nội dung tệp bằng cờ O_APPEND",
    "staticSummary": "Sandbox tự tạo src/dst; đối chiếu từng byte tệp đích và stdout; kiểm tra tĩnh open, read, write, close",
    "prompt": "Cho tên tệp nguồn src_path và tên tệp đích dst_path. Viết chương trình C trên Linux đọc toàn bộ nội dung từ src_path và ghi nối vào cuối tệp dst_path bằng cờ O_APPEND. Sau khi nối xong, xác định và in tổng kích thước (theo byte) của tệp dst_path. Nếu không mở được tệp nguồn, không làm thay đổi tệp đích và chỉ in -1.",
    "requirements": [
      "Sử dụng <fcntl.h>, <unistd.h> (có thể dùng thêm <sys/stat.h>).",
      "Mở tệp nguồn với O_RDONLY; mở tệp đích với O_WRONLY | O_CREAT | O_APPEND và quyền 0644.",
      "Sử dụng vòng lặp read() và write() xử lý short counts / short writes, sau đó gọi close() cho cả hai File Descriptor.",
      "Không sử dụng fopen, fread, fwrite, freopen để thao tác trên src_path và dst_path.",
      "Hỗ trợ cả dữ liệu nhị phân chứa byte '\\0'; chỉ in đúng 1 số nguyên là tổng kích thước byte của dst_path sau khi nối (hoặc -1 nếu lỗi)."
    ],
    "inputSpec": "Một dòng chứa hai tên tệp cách nhau bởi dấu cách: src_path dst_path.",
    "outputSpec": "Một số nguyên duy nhất là kích thước cuối cùng (tính theo byte) của tệp dst_path (hoặc -1 nếu lỗi).",
    "constraints": [
      "Độ dài mỗi tên tệp <= 128 ký tự",
      "0 <= kích thước mỗi tệp <= 10^6 byte"
    ],
    "example": {
      "note": "Giả sử src02.txt chứa \"_LINUX\" (6 byte) và dst02.txt có sẵn \"HELLO\" (5 byte). Sau khi chạy, dst02.txt chứa \"HELLO_LINUX\".",
      "input": "src02.txt dst02.txt",
      "output": "11"
    },
    "relatedTopics": [
      {
        "id": "2-4",
        "label": "2.4 File Descriptor, open() & Cờ O_CREAT / O_APPEND"
      },
      {
        "id": "2-5",
        "label": "2.5 Vòng lặp read() / write() chống Short Write"
      },
      {
        "id": "2-7",
        "label": "2.7 Đọc siêu dữ liệu tệp với stat() / fstat()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Mở tệp nguồn kiểm tra hợp lệ TRƯỚC khi gọi open(..., O_CREAT) trên tệp đích (để không tạo nhầm tệp đích nếu nguồn lỗi), dùng vòng lặp bù short write và lấy kích thước cuối bằng fstat().",
    "relatedQuestions": [
      "CR-01",
      "CR-04",
      "CR-44"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n\nint main() {\n    char src[256], dst[256];\n    scanf(\"%s %s\", src, dst);\n\n    int fd_in = open(src, O_RDONLY);\n    if (fd_in < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    int fd_out = open(dst, O_WRONLY | O_CREAT | O_APPEND, 0644);\n    if (fd_out < 0) {\n        close(fd_in);\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    unsigned char buf[4096];\n    ssize_t n;\n    while ((n = read(fd_in, buf, sizeof(buf))) > 0) {\n        ssize_t written = 0;\n        while (written < n) {\n            ssize_t w = write(fd_out, buf + written, n - written);\n            if (w <= 0) break;\n            written += w;\n        }\n    }\n\n    struct stat st;\n    fstat(fd_out, &st);\n\n    close(fd_in);\n    close(fd_out);\n    printf(\"%lld\\n\", (long long)st.st_size);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Mở src_path kiểm tra thành công trước rồi mới mở dst_path để bảo toàn nguyên trạng tệp đích nếu tệp nguồn không tồn tại.",
      "Cờ O_APPEND đảm bảo nhân Linux tự động dời con trỏ ghi về cuối tệp một cách nguyên tử ở mỗi lệnh write().",
      "Dùng fstat(fd_out, &st) lấy chính xác tổng kích thước mới của dst_path (kể cả phần dữ liệu có sẵn trước khi nối)."
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
        "O_APPEND",
        "O_CREAT"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fwrite",
        "freopen",
        "system",
        "popen"
      ],
      "qualityRules": [
        {
          "desc": "Truyền quyền 0644 khi dùng cờ O_CREAT",
          "regex": "0644",
          "flags": ""
        },
        {
          "desc": "Xử lý vòng lặp bù short write khi ghi ra tệp đích",
          "regex": "write_all|while\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\bwrite\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Xác định tổng kích thước tệp đích (fstat / stat / lseek SEEK_END)",
          "regex": "\\b(fstat|stat|SEEK_END)\\b",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Chỉ cộng số byte vừa đọc từ src mà quên cộng kích thước ban đầu của dst_path!",
          "regex": "printf\\s*\\([^,]+,\\s*total_read\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 2 — Cờ mở tệp O_APPEND & vòng lặp ghi chống short write (Mục 2.4, 2.5, 2.7 · Lab 2 Bài 2, 4).",
      "lineByLine": [
        {
          "lines": "Dòng 10–14",
          "code": "int fd_in = open(src, O_RDONLY);",
          "explain": "Mở tệp nguồn TRƯỚC tệp đích! Nhờ vậy nếu src không tồn tại thì chương trình in -1 và thoát ngay, không vô tình tạo ra tệp đích mới."
        },
        {
          "lines": "Dòng 16–21",
          "code": "open(dst, O_WRONLY | O_CREAT | O_APPEND, 0644);",
          "explain": "O_WRONLY (chỉ ghi), O_CREAT (tạo mới nếu chưa có, kèm quyền 0644), O_APPEND (luôn ghi nối vào cuối tệp)."
        },
        {
          "lines": "Dòng 25–32",
          "code": "while ((n = read(...)) > 0) { while (written < n) ... }",
          "explain": "Vòng while ngoài đọc tới EOF; vòng while trong đảm bảo ghi đủ trọn n byte vừa đọc (xử lý short write)."
        },
        {
          "lines": "Dòng 34–35",
          "code": "fstat(fd_out, &st);",
          "explain": "Lấy trực tiếp kích thước mới nhất của tệp đích từ fd_out đang mở thông qua trường st.st_size."
        },
        {
          "lines": "Dòng 37–39",
          "code": "close(fd_in); close(fd_out); printf(...);",
          "explain": "Đóng đủ cả 2 FD rồi in st_size dưới dạng long long."
        }
      ],
      "testCases": [
        {
          "name": "Nối vào tệp đích đã có dữ liệu",
          "caseDesc": "dst=\"HELLO\"(5), src=\"_LINUX\"(6)",
          "howHandled": "Cờ O_APPEND tự động ghi tiếp sau byte thứ 5 → dst=\"HELLO_LINUX\", fstat trả về 11."
        },
        {
          "name": "Tệp đích chưa tồn tại",
          "caseDesc": "dst chưa có trên đĩa",
          "howHandled": "Cờ O_CREAT kèm 0644 tự tạo tệp mới và ghi nội dung src vào."
        },
        {
          "name": "Tệp nguồn lỗi / không tồn tại",
          "caseDesc": "src sai đường dẫn",
          "howHandled": "open(src) < 0 trả về ngay trước khi mở dst → dst giữ nguyên, stdout in -1."
        },
        {
          "name": "Dữ liệu nhị phân có \\0 hoặc rỗng",
          "caseDesc": "src có byte 0x00 hoặc 0 byte",
          "howHandled": "Dùng buf unsigned char + số byte n của read(), không dùng chuỗi."
        }
      ],
      "examRecipe": [
        "Mở src trước bằng O_RDONLY — lỗi thì in -1 và return 0 ngay.",
        "Mở dst bằng O_WRONLY | O_CREAT | O_APPEND, 0644.",
        "Lặp read(fd_in) → vòng while ghi đủ n byte sang fd_out.",
        "Gọi fstat(fd_out, &st) lấy st.st_size rồi close cả hai FD và in kết quả."
      ]
    }
  },
  {
    "num": 3,
    "id": "CR-03",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Dễ",
    "title": "Đọc siêu dữ liệu tệp bằng stat()",
    "staticSummary": "Sandbox tạo tệp/thư mục với quyền xác định; kiểm tra tĩnh stat hoặc lstat",
    "prompt": "Cho đường dẫn path trong hệ thống tệp Linux. Sử dụng lời gọi hệ thống stat() (hoặc lstat()) để truy xuất thông tin siêu dữ liệu của đối tượng (loại tệp, kích thước theo byte, quyền truy cập ở hệ cơ số 8 gồm 3 chữ số) và in ra theo đúng quy cách. Nếu đối tượng không tồn tại hoặc stat() trả về -1, chỉ in -1.",
    "requirements": [
      "Sử dụng thư viện <sys/stat.h> và <unistd.h>.",
      "Bắt buộc gọi stat() hoặc lstat() trên struct stat; dùng S_ISREG(st.st_mode) và S_ISDIR(st.st_mode) để phân loại: REG (tệp thường), DIR (thư mục), OTHER (loại khác).",
      "In kích thước st_size (kiểu long long) và quyền (st_mode & 0777) dưới dạng số bát phân 3 chữ số (ví dụ %03o).",
      "Không dùng system() hay popen() để gọi lệnh shell (như ls, stat)."
    ],
    "inputSpec": "Một dòng chứa đường dẫn path (không chứa khoảng trắng).",
    "outputSpec": "Chuỗi dạng: <LOẠI> <KÍCH_THƯỚC_BYTE> <QUYỀN_3_CHỮ_SỐ_OCTAL> trên 1 dòng (hoặc -1 nếu thất bại).",
    "constraints": [
      "Độ dài path <= 256 ký tự",
      "0 <= st_size <= 10^9 byte"
    ],
    "example": {
      "note": "Giả sử tệp thường meta03.bin có kích thước 128 byte và quyền truy cập 0644.",
      "input": "meta03.bin",
      "output": "REG 128 644"
    },
    "relatedTopics": [
      {
        "id": "1-1",
        "label": "1.1 Kiến trúc Linux & Phân quyền rwx hệ bát phân"
      },
      {
        "id": "2-1",
        "label": "2.1 Các loại Tệp trên Linux & Thuộc tính Inode"
      },
      {
        "id": "2-7",
        "label": "2.7 File Metadata với stat(), lstat() & fstat()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Trường st_mode chứa cả bit loại tệp (S_IFMT) lẫn 12 bit quyền. Để trích đúng 9 bit quyền rwxrwxrwx dưới dạng 3 chữ số bát phân (kể cả trường hợp 007 -> \"007\"), bắt buộc mặt nạ (st.st_mode & 0777) kèm định dạng \"%03o\".",
    "relatedQuestions": [
      "CR-06",
      "CR-07",
      "CR-49"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <sys/stat.h>\n#include <unistd.h>\n\nint main() {\n    char path[300];\n    scanf(\"%s\", path);\n\n    struct stat st;\n    if (stat(path, &st) == -1) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    if (S_ISREG(st.st_mode)) {\n        printf(\"REG \");\n    } else if (S_ISDIR(st.st_mode)) {\n        printf(\"DIR \");\n    } else {\n        printf(\"OTHER \");\n    }\n\n    printf(\"%lld %03o\\n\", (long long)st.st_size, st.st_mode & 0777);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Macro POSIX S_ISREG() và S_ISDIR() kiểm tra phần bit loại tệp trong st_mode một cách chuẩn xác, khả chuyển.",
      "Phép AND bit (st.st_mode & 0777) lọc bỏ các bit loại tệp và SUID/SGID/Sticky, giữ lại đúng 9 bit quyền rwx của owner-group-others.",
      "Định dạng %03o đệm số 0 đứng đầu khi quyền nhỏ hơn 0100 (ví dụ quyền 0040 sẽ in đúng \"040\")."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "sys/stat.h",
        "unistd.h"
      ],
      "requiredApis": [
        "stat",
        "S_ISREG",
        "S_ISDIR"
      ],
      "forbiddenApis": [
        "system",
        "popen"
      ],
      "qualityRules": [
        {
          "desc": "Lọc 9 bit quyền bằng mặt nạ 0777",
          "regex": "&\\s*0777",
          "flags": ""
        },
        {
          "desc": "Định dạng bát phân đủ 3 chữ số %03o",
          "regex": "%03o",
          "flags": ""
        },
        {
          "desc": "Ép kiểu kích thước st_size sang long long tránh tràn 32-bit",
          "regex": "long\\s+long",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "In thẳng st.st_mode không qua & 0777 sẽ dính cả bit loại tệp (ví dụ in ra 100644 thay vì 644)!",
          "regex": "%0?3?o[\\s\\S]{0,40}st_mode\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 2 — Siêu dữ liệu tệp với stat() (Mục 2.7 · Lab 2 Bài 3 · Đề thi thật Câu 21). Đây chính là mẫu code siêu gọn giống hệt bài thi thật!",
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "code": "#include <sys/stat.h>, <unistd.h>",
          "explain": "<sys/stat.h> chứa struct stat, hàm stat() và các macro S_ISREG, S_ISDIR."
        },
        {
          "lines": "Dòng 9–13",
          "code": "struct stat st; if (stat(path, &st) == -1)",
          "explain": "Gọi stat() lấy metadata của path ghi vào biến st. Nếu tệp không tồn tại, stat() trả -1 → in -1 và dừng."
        },
        {
          "lines": "Dòng 15–21",
          "code": "S_ISREG(st.st_mode) / S_ISDIR(st.st_mode)",
          "explain": "Kiểm tra các bit loại tệp trong st_mode: tệp thường in REG, thư mục in DIR, các loại khác (FIFO, socket, device...) in OTHER."
        },
        {
          "lines": "Dòng 23",
          "code": "printf(\"%lld %03o\\n\", (long long)st.st_size, st.st_mode & 0777);",
          "explain": "Ép st_size sang long long in bằng %lld; lọc 9 bit quyền bằng (st.st_mode & 0777) và in đúng 3 chữ số bát phân bằng %03o (có số 0 đứng đầu nếu quyền như 075)."
        }
      ],
      "testCases": [
        {
          "name": "Tệp thường quyền 0644 / 0750",
          "caseDesc": "meta03.bin 128 byte 0644",
          "howHandled": "S_ISREG đúng → in \"REG 128 644\"."
        },
        {
          "name": "Thư mục",
          "caseDesc": "dir03 quyền 0755",
          "howHandled": "S_ISDIR đúng → in \"DIR <size> 755\"."
        },
        {
          "name": "Quyền có chữ số đầu bằng 0 (vd 0077)",
          "caseDesc": "Quyền nhỏ hơn 0100",
          "howHandled": "Định dạng %03o tự đệm đủ 3 chữ số (vd 077 thay vì 77)."
        },
        {
          "name": "Đường dẫn không tồn tại",
          "caseDesc": "missing.bin",
          "howHandled": "stat() trả về -1 → in \"-1\"."
        }
      ],
      "examRecipe": [
        "Đọc path → khai báo struct stat st → gọi if (stat(path, &st) == -1) in -1.",
        "Nhánh if (S_ISREG) / else if (S_ISDIR) / else in REG / DIR / OTHER.",
        "In (long long)st.st_size với %lld và (st.st_mode & 0777) với %03o."
      ]
    }
  },
  {
    "num": 4,
    "id": "CR-04",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Trung bình",
    "title": "Sao chép trích đoạn tệp theo offset và max_bytes",
    "staticSummary": "Tự tạo tệp nguồn và đối chiếu byte tệp đích; kiểm tra tĩnh open, lseek, read, write, close",
    "prompt": "Cho tên tệp nguồn src_path, tên tệp đích dst_path, vị trí bắt đầu offset (tính theo byte từ đầu tệp) và số byte tối đa cần sao chép max_bytes. Hãy viết chương trình C trên Linux đọc tối đa max_bytes byte từ src_path bắt đầu tại vị trí offset và ghi vào dst_path.",
    "requirements": [
      "Sử dụng <fcntl.h>, <unistd.h> (có thể dùng <sys/stat.h>).",
      "Sử dụng open (O_RDONLY cho nguồn; O_WRONLY | O_CREAT | O_TRUNC với quyền 0644 cho đích), lseek(SEEK_SET), read, write (vòng lặp xử lý short counts) và close.",
      "Không dùng hàm stdio (fopen, fread, fwrite, freopen) để đọc/ghi src_path và dst_path.",
      "Nếu không mở được tệp nguồn hoặc offset < 0: chỉ in -1.",
      "Nếu offset >= kích thước tệp hoặc max_bytes == 0: vẫn tạo/ghi đè tệp đích rỗng (0 byte) và in 0."
    ],
    "inputSpec": "Một dòng gồm: src_path dst_path offset max_bytes.",
    "outputSpec": "Số byte đã sao chép thành công (hoặc -1 nếu lỗi). Tệp đích dst_path phải khớp chính xác từng byte với trích đoạn.",
    "constraints": [
      "Độ dài mỗi tên tệp <= 128 ký tự",
      "-10^6 <= offset <= 10^6",
      "0 <= max_bytes <= 10^6"
    ],
    "example": {
      "note": "Giả sử t1_src.txt chứa chuỗi \"Hello Linux File IO!\". Sau khi chạy, t1_dst.txt chứa \"Linux\".",
      "input": "t1_src.txt t1_dst.txt 6 5",
      "output": "5"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Vòng lặp read() / write() & Short Count"
      },
      {
        "id": "2-6",
        "label": "2.6 Định vị con trỏ tệp ngẫu nhiên với lseek()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Kết hợp lseek(SEEK_SET) với giới hạn số byte đọc còn lại. Lưu ý kiểm tra điều kiện lỗi (offset < 0 hoặc mở nguồn lỗi) TRƯỚC khi mở tệp đích với O_TRUNC, và khi offset >= kích thước tệp thì vẫn tạo tệp đích rỗng 0 byte.",
    "relatedQuestions": [
      "CR-02",
      "CR-05",
      "CR-08",
      "CR-43"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n\nint main() {\n    char src[256], dst[256];\n    long long offset, max_bytes;\n    scanf(\"%s %s %lld %lld\", src, dst, &offset, &max_bytes);\n\n    if (offset < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    int fd_in = open(src, O_RDONLY);\n    if (fd_in < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\n    if (fd_out < 0) {\n        close(fd_in);\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    lseek(fd_in, (off_t)offset, SEEK_SET);\n\n    unsigned char buf[4096];\n    long long copied = 0;\n    while (copied < max_bytes) {\n        long long remain = max_bytes - copied;\n        size_t chunk = (remain < (long long)sizeof(buf)) ? (size_t)remain : sizeof(buf);\n        ssize_t n = read(fd_in, buf, chunk);\n        if (n <= 0) break;\n\n        ssize_t written = 0;\n        while (written < n) {\n            ssize_t w = write(fd_out, buf + written, n - written);\n            if (w <= 0) break;\n            written += w;\n        }\n        copied += n;\n    }\n\n    close(fd_in);\n    close(fd_out);\n    printf(\"%lld\\n\", copied);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Kiểm tra offset < 0 và mở src_path trước khi mở dst_path để tránh xóa trắng dst_path khi đầu vào không hợp lệ.",
      "Dùng lseek(fd_in, 0, SEEK_END) lấy kích thước tệp nguồn; nếu offset >= file_sz hoặc max_bytes == 0 thì vẫn tạo dst_path 0 byte (nhờ O_CREAT | O_TRUNC) rồi in 0.",
      "Giới hạn lượng đọc mỗi vòng want = min(left, sizeof(buf)) để không bao giờ đọc lố quá max_bytes."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "fcntl.h",
        "unistd.h"
      ],
      "requiredApis": [
        "open",
        "lseek",
        "read",
        "write",
        "close",
        "SEEK_SET",
        "O_TRUNC"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fwrite",
        "fseek",
        "freopen",
        "system",
        "popen"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra điều kiện biên offset < 0",
          "regex": "offset\\s*<\\s*0",
          "flags": ""
        },
        {
          "desc": "Truyền quyền 0644 khi mở tệp đích O_CREAT | O_TRUNC",
          "regex": "0644",
          "flags": ""
        },
        {
          "desc": "Xử lý giới hạn số byte đọc theo max_bytes",
          "regex": "max_bytes|left|rem",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 — Định vị con trỏ tệp bằng lseek() kết hợp đọc/ghi giới hạn (Mục 2.5, 2.6 · Lab 2 Bài 1b).",
      "lineByLine": [
        {
          "lines": "Dòng 10–19",
          "code": "if (offset < 0) ... int fd_in = open(src, O_RDONLY);",
          "explain": "Kiểm tra offset âm và lỗi mở tệp nguồn TRƯỚC khi tạo tệp đích."
        },
        {
          "lines": "Dòng 21–26",
          "code": "open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);",
          "explain": "Mở tệp đích với O_TRUNC để ghi đè hoàn toàn; nếu max_bytes == 0 hoặc offset >= size thì tệp đích vẫn được tạo rỗng 0 byte đúng yêu cầu."
        },
        {
          "lines": "Dòng 28",
          "code": "lseek(fd_in, (off_t)offset, SEEK_SET);",
          "explain": "Nhảy con trỏ đọc của tệp nguồn tới đúng vị trí byte thứ offset tính từ đầu tệp."
        },
        {
          "lines": "Dòng 32–45",
          "code": "while (copied < max_bytes) { chunk = min(remain, 4096); ... }",
          "explain": "Mỗi lần chỉ đọc tối đa min(số byte còn cần, 4096) để không bao giờ đọc lố quá max_bytes. Gặp EOF (n <= 0) thì dừng ngay."
        }
      ],
      "testCases": [
        {
          "name": "Trích đoạn giữa tệp",
          "caseDesc": "\"Hello Linux File IO!\", offset=6, max_bytes=5",
          "howHandled": "lseek tới byte 6 (\"L\"), đọc đúng 5 byte \"Linux\" → in 5."
        },
        {
          "name": "offset >= kích thước tệp",
          "caseDesc": "offset=100 trên tệp 20 byte",
          "howHandled": "Tệp đích đã tạo rỗng bằng O_TRUNC, read() trả 0 ngay → in 0."
        },
        {
          "name": "max_bytes == 0",
          "caseDesc": "Sao chép 0 byte",
          "howHandled": "Vòng while (0 < 0) không chạy, tệp đích rỗng 0 byte → in 0."
        },
        {
          "name": "offset < 0 hoặc src không tồn tại",
          "caseDesc": "offset = -5",
          "howHandled": "Kiểm tra ngay ở đầu → in -1 và không tạo tệp đích."
        }
      ],
      "examRecipe": [
        "Kiểm tra offset < 0 và open(src, O_RDONLY) < 0 → in -1.",
        "Mở dst bằng O_WRONLY | O_CREAT | O_TRUNC, 0644.",
        "Gọi lseek(fd_in, offset, SEEK_SET).",
        "Lặp khi copied < max_bytes: đọc min(max_bytes - copied, sizeof(buf)) byte, ghi đủ sang fd_out, tăng copied += n.",
        "Đóng 2 FD và in copied."
      ]
    }
  },
  {
    "num": 5,
    "id": "CR-05",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Trung bình",
    "title": "Đảo ngược thứ tự byte của tệp nhị phân bằng lseek",
    "staticSummary": "Sandbox kiểm tra từng byte tệp đích đảo ngược; kiểm tra tĩnh open, lseek, read, write, close",
    "prompt": "Cho đường dẫn tệp nguồn src_path, đường dẫn tệp đích dst_path và kích thước bộ đệm buf_size. Hãy đảo ngược toàn bộ thứ tự các byte của tệp src_path và ghi kết quả ra tệp dst_path theo từng khối kích thước tối đa buf_size (đọc từ cuối tệp lùi dần về đầu tệp, đảo mảng byte trong bộ đệm rồi ghi vào dst_path). Nếu không mở được tệp nguồn hoặc buf_size <= 0, chỉ in -1.",
    "requirements": [
      "Sử dụng <fcntl.h>, <unistd.h> (và <stdlib.h> để cấp phát bộ đệm theo buf_size).",
      "Sử dụng open, lseek (dùng SEEK_END lấy kích thước tệp nguồn và SEEK_SET định vị từng khối), read, write, close.",
      "Không dùng fopen, fread, fwrite, fseek để thao tác tệp.",
      "Hỗ trợ tệp nhị phân có byte '\\0' và tệp rỗng (tạo tệp đích rỗng và in 0)."
    ],
    "inputSpec": "Một dòng chứa: src_path dst_path buf_size.",
    "outputSpec": "Một số nguyên là tổng số byte đã sao chép đảo ngược sang dst_path (hoặc -1 nếu lỗi).",
    "constraints": [
      "Độ dài mỗi tên tệp <= 128 ký tự",
      "1 <= buf_size <= 65536",
      "0 <= kích thước tệp nguồn <= 10^6 byte"
    ],
    "example": {
      "note": "Giả sử rev_in.bin chứa 6 byte \"ABCDE\\n\". Sau khi chạy, rev_out.bin chứa \"\\nEDCBA\".",
      "input": "rev_in.bin rev_out.bin 4",
      "output": "6"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Đọc/ghi chính xác khối byte (read_exact / write_all)"
      },
      {
        "id": "2-6",
        "label": "2.6 Kỹ thuật đọc lùi từng khối với lseek(SEEK_END / SEEK_SET)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Đảo ngược tệp lớn trong bộ nhớ giới hạn O(buf_size) thay vì nạp cả tệp vào RAM. Nếu đọc từng 1 byte bằng lseek + read trên tệp 1 MB sẽ tốn 2 triệu lời gọi hệ thống; đọc lùi từng khối buf_size nhanh gấp hàng ngàn lần.",
    "relatedQuestions": [
      "CR-04",
      "CR-08",
      "CR-43"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdlib.h>\n#include <fcntl.h>\n#include <unistd.h>\n\nint main() {\n    char src[256], dst[256];\n    int buf_size;\n    scanf(\"%s %s %d\", src, dst, &buf_size);\n\n    if (buf_size <= 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    int fd_in = open(src, O_RDONLY);\n    if (fd_in < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\n    if (fd_out < 0) {\n        close(fd_in);\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    off_t file_size = lseek(fd_in, 0, SEEK_END);\n    unsigned char *buf = (unsigned char *)malloc(buf_size);\n\n    off_t pos = file_size;\n    long long total = 0;\n\n    while (pos > 0) {\n        int chunk = (pos >= buf_size) ? buf_size : (int)pos;\n        pos -= chunk;\n        lseek(fd_in, pos, SEEK_SET);\n\n        int got = 0;\n        while (got < chunk) {\n            ssize_t n = read(fd_in, buf + got, chunk - got);\n            if (n <= 0) break;\n            got += n;\n        }\n\n        for (int i = 0; i < got / 2; i++) {\n            unsigned char tmp = buf[i];\n            buf[i] = buf[got - 1 - i];\n            buf[got - 1 - i] = tmp;\n        }\n\n        int written = 0;\n        while (written < got) {\n            ssize_t w = write(fd_out, buf + written, got - written);\n            if (w <= 0) break;\n            written += w;\n        }\n        total += got;\n    }\n\n    free(buf);\n    close(fd_in);\n    close(fd_out);\n    printf(\"%lld\\n\", total);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Cấp phát đúng buf_size byte bằng malloc() và đọc lùi các đoạn [pos - chunk, pos) từ cuối tệp về 0.",
      "Phần dư đầu tệp (khi pos < buf_size, ví dụ 6 byte với buf_size = 4 còn dư 2 byte đầu \"AB\") được xử lý tự nhiên bởi chunk = pos.",
      "Giải phóng bộ nhớ free(buf) và đóng cả hai mô tả tệp đầy đủ trước khi thoát."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "fcntl.h",
        "unistd.h",
        "stdlib.h"
      ],
      "requiredApis": [
        "open",
        "lseek",
        "read",
        "write",
        "close",
        "SEEK_END",
        "SEEK_SET"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fwrite",
        "fseek",
        "freopen"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra điều kiện biên buf_size <= 0",
          "regex": "buf_size\\s*<=\\s*0",
          "flags": ""
        },
        {
          "desc": "Cấp phát động theo buf_size và giải phóng free()",
          "regex": "\\bmalloc\\b[\\s\\S]*\\bfree\\b",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Đọc lùi từng 1 byte bỏ qua tham số buf_size sẽ rất chậm trên tệp 1 MB!",
          "regex": "\\bread\\s*\\([^,]+,[^,]+,\\s*1\\s*\\)",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 2 — Kết hợp lseek(SEEK_END) và lseek(SEEK_SET) đọc lùi theo khối (Mục 2.6).",
      "lineByLine": [
        {
          "lines": "Dòng 11–19",
          "code": "if (buf_size <= 0) ... open(src, O_RDONLY)",
          "explain": "Kiểm tra buf_size hợp lệ và tệp nguồn mở được trước khi mở tệp đích."
        },
        {
          "lines": "Dòng 29–30",
          "code": "off_t file_size = lseek(fd_in, 0, SEEK_END); malloc(buf_size);",
          "explain": "lseek tới SEEK_END trả về đúng tổng kích thước byte của tệp nguồn; cấp phát mảng buf động đúng bằng buf_size."
        },
        {
          "lines": "Dòng 35–38",
          "code": "chunk = min(pos, buf_size); pos -= chunk; lseek(fd_in, pos, SEEK_SET);",
          "explain": "Lùi con trỏ pos về đầu khối cuối chưa đọc (nếu còn ít hơn buf_size ở đầu tệp thì chỉ đọc đúng pos byte)."
        },
        {
          "lines": "Dòng 47–51",
          "code": "for (int i = 0; i < got / 2; i++) swap(buf[i], buf[got-1-i]);",
          "explain": "Đảo ngược thứ tự byte bên trong khối vừa đọc rồi ghi ra tệp đích."
        },
        {
          "lines": "Dòng 62–65",
          "code": "free(buf); close(fd_in); close(fd_out);",
          "explain": "Giải phóng bộ nhớ đệm Heap và đóng 2 FD."
        }
      ],
      "testCases": [
        {
          "name": "Kích thước không chia hết cho buf_size",
          "caseDesc": "\"ABCDE\\n\" (6 byte), buf_size = 4",
          "howHandled": "Lượt 1 đọc [2..5]=\"CDE\\n\" đảo thành \"\\nEDC\"; lượt 2 pos=2 < 4 nên chunk=2 đọc [0..1]=\"AB\" đảo thành \"BA\" → \"\\nEDCBA\", in 6."
        },
        {
          "name": "Tệp rỗng 0 byte",
          "caseDesc": "file_size = 0",
          "howHandled": "pos = 0 nên vòng while không chạy, tệp đích rỗng 0 byte → in 0."
        },
        {
          "name": "Tệp nhị phân có \\0",
          "caseDesc": "Byte 0x00 xen kẽ",
          "howHandled": "Đảo trên mảng unsigned char theo got, hoàn toàn an toàn."
        },
        {
          "name": "Lỗi buf_size <= 0 hoặc nguồn lỗi",
          "caseDesc": "buf_size = 0",
          "howHandled": "In -1 ngay ở đầu."
        }
      ],
      "examRecipe": [
        "Kiểm tra buf_size <= 0 và mở src (O_RDONLY) → lỗi in -1.",
        "Mở dst (O_WRONLY|O_CREAT|O_TRUNC, 0644); lấy file_size = lseek(fd_in, 0, SEEK_END).",
        "Đặt pos = file_size; lặp khi pos > 0: chunk = min(pos, buf_size), pos -= chunk, lseek(fd_in, pos, SEEK_SET).",
        "Đọc chunk byte → đảo ngược mảng buf → ghi ra fd_out.",
        "free(buf), close 2 FD, in tổng số byte."
      ]
    }
  },
  {
    "num": 6,
    "id": "CR-06",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Trung bình",
    "title": "Thống kê các tệp theo phần mở rộng trong thư mục",
    "staticSummary": "Sandbox tạo cây thư mục mẫu; kiểm tra tĩnh opendir, readdir, closedir, stat",
    "prompt": "Cho đường dẫn thư mục dir_path và chuỗi hậu tố ext (ví dụ .txt hoặc .c). Hãy duyệt các mục nằm trực tiếp bên trong dir_path (không đệ quy vào thư mục con), bỏ qua '.' và '..', chỉ đếm các tệp thường (regular file) có tên kết thúc chính xác bằng hậu tố ext (phân biệt hoa thường). Tính tổng số tệp khớp và tổng kích thước (byte) của các tệp đó. Nếu opendir() thất bại, chỉ in -1.",
    "requirements": [
      "Sử dụng <dirent.h>, <sys/stat.h>, <string.h>.",
      "Bắt buộc dùng opendir(), readdir(), closedir() kết hợp stat() (hoặc lstat()) với đường dẫn đầy đủ ghép từ dir_path và d_name.",
      "Chỉ tính các mục thỏa mãn S_ISREG(st.st_mode); bỏ qua thư mục con kể cả khi tên thư mục con kết thúc bằng ext.",
      "Không dùng system() hoặc popen() gọi lệnh tìm kiếm ngoài."
    ],
    "inputSpec": "Một dòng gồm: dir_path ext (đều không chứa khoảng trắng).",
    "outputSpec": "Hai số nguyên trên một dòng: <số_tệp_khớp> <tổng_kích_thước_byte> (hoặc -1 nếu không mở được thư mục).",
    "constraints": [
      "Độ dài dir_path <= 256, 1 <= strlen(ext) <= 32",
      "Số lượng mục trong thư mục <= 500"
    ],
    "example": {
      "note": "Trong dir06 có: a.txt (10 byte), b.txt (25 byte), c.log (100 byte) và thư mục con sub.txt/ (bỏ qua).",
      "input": "dir06 .txt",
      "output": "2 35"
    },
    "relatedTopics": [
      {
        "id": "2-2",
        "label": "2.2 Đường dẫn (Pathnames) & Cây Thư mục Linux"
      },
      {
        "id": "2-7",
        "label": "2.7 Kiểm tra tệp thường S_ISREG() với stat()"
      },
      {
        "id": "2-8",
        "label": "2.8 Duyệt thư mục bằng opendir(), readdir(), closedir()"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Bẫy kinh điển nhất của readdir() là truyền thẳng de->d_name vào stat() thay vì ghép \"dir_path/d_name\" — khiến stat() tìm nhầm trong thư mục hiện hành và thất bại toàn bộ!",
    "relatedQuestions": [
      "CR-03",
      "CR-48"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <string.h>\n#include <dirent.h>\n#include <sys/stat.h>\n\nint main() {\n    char dir_path[300], ext[64];\n    scanf(\"%s %s\", dir_path, ext);\n\n    DIR *dir = opendir(dir_path);\n    if (dir == NULL) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    int ext_len = strlen(ext);\n    long long count = 0, total_size = 0;\n    struct dirent *de;\n\n    while ((de = readdir(dir)) != NULL) {\n        if (strcmp(de->d_name, \".\") == 0 || strcmp(de->d_name, \"..\") == 0) {\n            continue;\n        }\n\n        char full_path[600];\n        snprintf(full_path, sizeof(full_path), \"%s/%s\", dir_path, de->d_name);\n\n        struct stat st;\n        if (stat(full_path, &st) == 0 && S_ISREG(st.st_mode)) {\n            int name_len = strlen(de->d_name);\n            if (name_len >= ext_len && strcmp(de->d_name + name_len - ext_len, ext) == 0) {\n                count++;\n                total_size += st.st_size;\n            }\n        }\n    }\n\n    closedir(dir);\n    printf(\"%lld %lld\\n\", count, total_size);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "So sánh hậu tố chính xác ở cuối chuỗi bằng strcmp(de->d_name + name_len - ext_len, ext) == 0 (tránh dùng strstr vì strstr(\".txt.bak\", \".txt\") sẽ bắt nhầm!).",
      "Luôn ghép đường dẫn đầy đủ \"%s/%s\" trước khi gọi stat() và kiểm tra S_ISREG(st.st_mode) để loại thư mục con có tên trùng hậu tố như sub.txt/."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "dirent.h",
        "sys/stat.h",
        "string.h"
      ],
      "requiredApis": [
        "opendir",
        "readdir",
        "closedir",
        "stat",
        "S_ISREG"
      ],
      "forbiddenApis": [
        "system",
        "popen"
      ],
      "qualityRules": [
        {
          "desc": "Ghép đường dẫn dir_path và d_name trước khi gọi stat()",
          "regex": "snprintf|sprintf|strcat",
          "flags": ""
        },
        {
          "desc": "Bỏ qua hai mục đặc biệt \".\" và \"..\"",
          "regex": "\"\\.\"[\\s\\S]*\"\\.\\.\"",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng strstr() tìm hậu tố sẽ khớp nhầm các tệp dạng file.txt.bak!",
          "regex": "\\bstrstr\\s*\\(",
          "flags": ""
        },
        {
          "desc": "Gọi stat(de->d_name, ...) trực tiếp không ghép dir_path sẽ tìm sai thư mục!",
          "regex": "\\bl?stat\\s*\\(\\s*\\w+->d_name\\s*,",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 2 — Duyệt thư mục với <dirent.h> kết hợp kiểm tra S_ISREG (Mục 2.8 · Lab 2 Bài 6, 7).",
      "lineByLine": [
        {
          "lines": "Dòng 10–14",
          "code": "DIR *dir = opendir(dir_path); if (dir == NULL)",
          "explain": "Mở luồng thư mục. Nếu đường dẫn không tồn tại hoặc không phải thư mục, opendir() trả NULL → in -1."
        },
        {
          "lines": "Dòng 20–23",
          "code": "while ((de = readdir(dir)) != NULL) { skip \".\" and \"..\" }",
          "explain": "Duyệt từng mục trong thư mục, bỏ qua hai liên kết đặc biệt \".\" và \"..\"."
        },
        {
          "lines": "Dòng 25–26",
          "code": "snprintf(full_path, sizeof(full_path), \"%s/%s\", dir_path, de->d_name);",
          "explain": "Bắt buộc ghép dir_path với de->d_name để stat() tìm đúng tệp nằm bên trong dir_path."
        },
        {
          "lines": "Dòng 28–34",
          "code": "stat(full_path, &st) == 0 && S_ISREG(st.st_mode) ... strcmp(tail, ext) == 0",
          "explain": "Chỉ nhận tệp thường (bỏ qua thư mục con dù tên kết thúc bằng ext!). Kiểm tra hậu tố phân biệt hoa thường bằng cách so chuỗi từ vị trí (name_len - ext_len)."
        }
      ],
      "testCases": [
        {
          "name": "Thư mục con trùng đuôi ext",
          "caseDesc": "Thư mục sub.txt/ bên trong dir06",
          "howHandled": "S_ISREG(st.st_mode) trả về 0 với thư mục → bỏ qua chính xác."
        },
        {
          "name": "Tên tệp ngắn hơn ext",
          "caseDesc": "Tệp tên \"a\" khi ext=\".txt\"",
          "howHandled": "Kiểm tra name_len >= ext_len trước khi trừ con trỏ tránh truy cập âm."
        },
        {
          "name": "Không có tệp nào khớp",
          "caseDesc": "Thư mục rỗng hoặc không khớp đuôi",
          "howHandled": "In \"0 0\"."
        },
        {
          "name": "Không mở được thư mục",
          "caseDesc": "dir_path không tồn tại",
          "howHandled": "opendir() == NULL → in \"-1\"."
        }
      ],
      "examRecipe": [
        "Header: <dirent.h>, <sys/stat.h>, <string.h>.",
        "opendir(dir_path) == NULL → in -1.",
        "while ((de = readdir(dir)) != NULL): bỏ \".\" và \"..\", ghép full_path = dir_path/d_name.",
        "stat(full_path, &st) == 0 && S_ISREG(st.st_mode) && so đuôi bằng strcmp(name + len - ext_len, ext) == 0.",
        "closedir(dir) và in count total_size."
      ]
    }
  },
  {
    "num": 7,
    "id": "CR-07",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Khó",
    "title": "Biến đổi XOR tệp tại chỗ bằng Memory-Mapped I/O (mmap)",
    "staticSummary": "Đối chiếu nội dung tệp sau XOR và stdout; kiểm tra tĩnh open, fstat, mmap, munmap, close",
    "prompt": "Cho đường dẫn tệp file_path và khóa nguyên key (0 <= key <= 255). Viết chương trình C sử dụng Memory-Mapped I/O để mở tệp, ánh xạ nội dung tệp vào vùng nhớ ảo với quyền đọc/ghi dùng chung (MAP_SHARED), biến đổi từng byte b của tệp thành (b ^ key) trực tiếp trên vùng ánh xạ, đồng thời tính tổng giá trị nguyên không dấu (0..255) của tất cả các byte sau khi biến đổi theo modulo 1000000007. Với tệp rỗng 0 byte, không gọi mmap() (tránh lỗi EINVAL) và in 0. Nếu mở tệp hoặc ánh xạ thất bại, chỉ in -1.",
    "requirements": [
      "Sử dụng <fcntl.h>, <sys/mman.h>, <sys/stat.h>, <unistd.h>.",
      "Bắt buộc dùng open(..., O_RDWR), fstat(), mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0), munmap() và close().",
      "Không dùng read()/write() hay fopen()/fread()/fwrite() để sửa đổi dữ liệu tệp.",
      "Xử lý an toàn tệp kích thước 0 byte (không truyền length = 0 vào mmap) và lỗi MAP_FAILED."
    ],
    "inputSpec": "Một dòng chứa: file_path key.",
    "outputSpec": "Một số nguyên duy nhất trên stdout; tệp file_path bị ghi đè tại chỗ sau khi XOR.",
    "constraints": [
      "Độ dài file_path <= 128 ký tự",
      "0 <= key <= 255",
      "0 <= kích thước tệp <= 10^7 byte"
    ],
    "example": {
      "note": "Giả sử xor07.bin có 3 byte [0x41, 0x00, 0xFF], key = 15 (0x0F). Sau XOR thành [0x4E (78), 0x0F (15), 0xF0 (240)], tổng = 333.",
      "input": "xor07.bin 15",
      "output": "333"
    },
    "relatedTopics": [
      {
        "id": "2-7",
        "label": "2.7 Lấy kích thước tệp qua fstat()"
      },
      {
        "id": "2-10",
        "label": "2.10 Memory-Mapped I/O: mmap(), MAP_SHARED vs MAP_PRIVATE"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Muốn các thay đổi trên con trỏ bộ nhớ tự động đồng bộ xuống đĩa cứng, bắt buộc phải mở tệp với O_RDWR (nếu O_RDONLY thì PROT_WRITE sẽ bị lỗi EACCES!) và dùng cờ MAP_SHARED (nếu MAP_PRIVATE thì sửa đổi chỉ nằm trên bản sao Copy-on-Write trong RAM, tệp gốc không đổi!).",
    "relatedQuestions": [
      "CR-03",
      "CR-08"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n#include <sys/mman.h>\n\nint main() {\n    char path[256];\n    int key;\n    scanf(\"%s %d\", path, &key);\n\n    int fd = open(path, O_RDWR);\n    if (fd < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    struct stat st;\n    if (fstat(fd, &st) < 0) {\n        close(fd);\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    if (st.st_size == 0) {\n        close(fd);\n        printf(\"0\\n\");\n        return 0;\n    }\n\n    unsigned char *data = mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);\n    if (data == MAP_FAILED) {\n        close(fd);\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    long long sum = 0;\n    long long mod = 1000000007LL;\n    for (off_t i = 0; i < st.st_size; i++) {\n        data[i] = data[i] ^ (unsigned char)key;\n        sum = (sum + data[i]) % mod;\n    }\n\n    munmap(data, st.st_size);\n    close(fd);\n    printf(\"%lld\\n\", sum);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Xử lý riêng st.st_size == 0 trước khi gọi mmap() vì POSIX quy định truyền length = 0 vào mmap() sẽ thất bại với lỗi EINVAL.",
      "Dùng con trỏ unsigned char * để giá trị từng byte sau XOR luôn nằm trong [0..255] (nếu dùng char có dấu thì byte >= 128 sẽ bị mở rộng dấu thành số âm!).",
      "Kết hợp O_RDWR + PROT_READ | PROT_WRITE + MAP_SHARED rồi thu hồi vùng ánh xạ bằng munmap()."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "fcntl.h",
        "sys/mman.h",
        "sys/stat.h",
        "unistd.h"
      ],
      "requiredApis": [
        "open",
        "fstat",
        "mmap",
        "munmap",
        "close",
        "O_RDWR",
        "PROT_WRITE",
        "MAP_SHARED"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fwrite",
        "read",
        "write"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra tệp rỗng st_size == 0 trước khi gọi mmap()",
          "regex": "st_size\\s*==\\s*0",
          "flags": ""
        },
        {
          "desc": "Kiểm tra kết quả ánh xạ với hằng MAP_FAILED",
          "regex": "MAP_FAILED",
          "flags": ""
        },
        {
          "desc": "Dùng kiểu không dấu unsigned char / uint8_t để không bị âm khi cộng byte >= 0x80",
          "regex": "unsigned\\s+char|uint8_t",
          "flags": ""
        }
      ],
      "antiPatterns": [
        {
          "desc": "Dùng MAP_PRIVATE thay vì MAP_SHARED sẽ không ghi thay đổi xuống tệp gốc!",
          "regex": "\\bMAP_PRIVATE\\b",
          "flags": ""
        }
      ]
    },
    "detailGuide": {
      "origin": "Chương 2 — Memory-Mapped I/O với mmap() / munmap() (Mục 2.10 · Slide APT02).",
      "lineByLine": [
        {
          "lines": "Dòng 12–16",
          "code": "int fd = open(path, O_RDWR);",
          "explain": "Muốn ánh xạ cả đọc và ghi sửa tệp tại chỗ, bắt buộc mở với O_RDWR (nếu chỉ mở O_WRONLY thì mmap với PROT_READ sẽ thất bại!)."
        },
        {
          "lines": "Dòng 25–29",
          "code": "if (st.st_size == 0) { close(fd); printf(\"0\\n\"); return 0; }",
          "explain": "Bẫy quan trọng nhất của mmap: truyền length = 0 sẽ báo lỗi EINVAL (MAP_FAILED). Với tệp 0 byte phải dừng sớm và in 0."
        },
        {
          "lines": "Dòng 31–36",
          "code": "mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0)",
          "explain": "Ánh xạ toàn bộ tệp vào mảng byte data[]. Cờ MAP_SHARED đảm bảo mọi sửa đổi trên data[i] được ghi thẳng xuống tệp thật trên đĩa."
        },
        {
          "lines": "Dòng 38–43",
          "code": "data[i] = data[i] ^ key; sum = (sum + data[i]) % mod;",
          "explain": "Biến đổi XOR trực tiếp trên vùng nhớ ánh xạ và cộng dồn giá trị unsigned char (0..255) theo modulo 10^9 + 7."
        },
        {
          "lines": "Dòng 45–46",
          "code": "munmap(data, st.st_size); close(fd);",
          "explain": "Gỡ ánh xạ (đồng thời đẩy trang bẩn xuống đĩa) và đóng FD."
        }
      ],
      "testCases": [
        {
          "name": "Tệp nhị phân chuẩn",
          "caseDesc": "[0x41, 0x00, 0xFF], key=15",
          "howHandled": "Sau XOR thành [78, 15, 240], tệp trên đĩa bị ghi đè đúng 3 byte đó và stdout in 333."
        },
        {
          "name": "Tệp rỗng 0 byte",
          "caseDesc": "st.st_size == 0",
          "howHandled": "Tránh gọi mmap(length=0), đóng fd và in 0."
        },
        {
          "name": "Tệp lớn 10 MB",
          "caseDesc": "Tổng byte có thể tới 2.55 * 10^9",
          "howHandled": "Lấy modulo 1000000007 ở mỗi bước bằng long long → không bao giờ tràn."
        },
        {
          "name": "Không mở được tệp",
          "caseDesc": "path sai hoặc chỉ đọc",
          "howHandled": "open() < 0 hoặc data == MAP_FAILED → in -1."
        }
      ],
      "examRecipe": [
        "Header: <fcntl.h>, <unistd.h>, <sys/stat.h>, <sys/mman.h>.",
        "open(path, O_RDWR) → fstat(fd, &st). Nếu st.st_size == 0 → close và in 0.",
        "mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0); kiểm tra == MAP_FAILED.",
        "Duyệt i = 0..st_size-1 trên unsigned char *: data[i] ^= key; sum = (sum + data[i]) % 1000000007.",
        "munmap(data, st.st_size); close(fd); in sum."
      ]
    }
  },
  {
    "num": 8,
    "id": "CR-08",
    "part": "File",
    "partLabel": "Phần 1 · Lập trình File trên Linux",
    "difficulty": "Khó",
    "title": "Cập nhật ngẫu nhiên bản ghi nhị phân cố định kích thước bằng lseek",
    "staticSummary": "Sandbox tạo tệp bản ghi struct {int32_t id; int32_t score;}; kiểm tra tĩnh open, lseek, read, write, close",
    "prompt": "Một tệp nhị phân lưu liên tiếp N bản ghi có kích thước cố định 8 byte theo cấu trúc: struct Record { int32_t id; int32_t score; };. Cho đường dẫn tệp file_path, số lệnh q và q thao tác dạng (idx, delta). Với mỗi thao tác, nếu idx hợp lệ (0 <= idx < N), dùng lseek() nhảy trực tiếp tới bản ghi thứ idx trong tệp để cộng thêm delta vào trường score và ghi đè lại đúng vị trí đó (bỏ qua lệnh nếu idx ngoài phạm vi [0, N-1]). Sau khi xử lý hết q lệnh, đọc lại tất cả N bản ghi và in tổng score. Nếu không mở được tệp hoặc kích thước tệp không chia hết cho 8, chỉ in -1.",
    "requirements": [
      "Sử dụng <fcntl.h>, <unistd.h>, <stdint.h>, <sys/stat.h>.",
      "Bắt buộc dùng open(..., O_RDWR), lseek(..., SEEK_SET), read(), write(), close() để truy cập trực tiếp từng bản ghi theo offset idx * sizeof(struct Record).",
      "Không dùng fopen, fread, fwrite, fseek; không nạp cả tệp lớn vào mảng để sửa một lần ở cuối thay cho truy cập ngẫu nhiên.",
      "Xử lý đầy đủ trường hợp idx nằm ngoài [0, N-1] (bỏ qua an toàn)."
    ],
    "inputSpec": "Dòng 1: file_path q. q dòng tiếp theo: mỗi dòng gồm 2 số nguyên idx delta.",
    "outputSpec": "Một số nguyên (long long) là tổng giá trị score của toàn bộ N bản ghi sau khi thực hiện q lệnh (hoặc -1 nếu lỗi).",
    "constraints": [
      "1 <= N <= 10^5",
      "0 <= q <= 10^4",
      "-10^5 <= score, delta <= 10^5"
    ],
    "example": {
      "note": "Tệp rec08.bin ban đầu chứa 3 bản ghi: (101, 10), (102, 20), (103, 30). Lệnh (1, +5) -> 25; (0, -3) -> 7; (5, 100) -> bỏ qua. Tổng score: 7 + 25 + 30 = 62.",
      "input": "rec08.bin 3\n1 5\n0 -3\n5 100",
      "output": "62"
    },
    "relatedTopics": [
      {
        "id": "2-5",
        "label": "2.5 Đọc/ghi cấu trúc nhị phân với read() & write()"
      },
      {
        "id": "2-6",
        "label": "2.6 Truy cập ngẫu nhiên bản ghi bằng lseek(SEEK_SET)"
      }
    ],
    "relatedKnowledgeNote": "Vùng kiến thức: Lưu ý sau khi gọi read(fd, &rec, sizeof(rec)), con trỏ tệp của nhân Linux đã tự động tiến thêm 8 byte sang bản ghi kế tiếp! Vì vậy trước khi gọi write() ghi đè lại bản ghi cũ, BẮT BUỘC phải gọi lseek(fd, off, SEEK_SET) một lần nữa lùi về đúng vị trí off!",
    "relatedQuestions": [
      "CR-04",
      "CR-05",
      "CR-07"
    ],
    "starterCode": "",
    "solution": "#include <stdio.h>\n#include <stdint.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n\nstruct Record {\n    int32_t id;\n    int32_t score;\n};\n\nint main() {\n    char path[256];\n    int q;\n    scanf(\"%s %d\", path, &q);\n\n    int fd = open(path, O_RDWR);\n    if (fd < 0) {\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    struct stat st;\n    if (fstat(fd, &st) < 0 || st.st_size % sizeof(struct Record) != 0) {\n        close(fd);\n        printf(\"-1\\n\");\n        return 0;\n    }\n\n    long long N = st.st_size / sizeof(struct Record);\n\n    for (int i = 0; i < q; i++) {\n        long long idx;\n        int32_t delta;\n        scanf(\"%lld %d\", &idx, &delta);\n\n        if (idx < 0 || idx >= N) continue;\n\n        off_t pos = idx * (off_t)sizeof(struct Record);\n        struct Record rec;\n\n        lseek(fd, pos, SEEK_SET);\n        read(fd, &rec, sizeof(rec));\n        rec.score += delta;\n        lseek(fd, pos, SEEK_SET);\n        write(fd, &rec, sizeof(rec));\n    }\n\n    lseek(fd, 0, SEEK_SET);\n    long long total = 0;\n    struct Record rec;\n    for (long long i = 0; i < N; i++) {\n        read(fd, &rec, sizeof(rec));\n        total += rec.score;\n    }\n\n    close(fd);\n    printf(\"%lld\\n\", total);\n    return 0;\n}\n",
    "codeWalkthrough": [
      "Kiểm tra st.st_size % sizeof(struct Record) != 0 ngay từ đầu để bắt lỗi tệp hỏng không tròn bản ghi 8 byte.",
      "Gọi lseek(fd, off, SEEK_SET) CẢ TRƯỚC read() LẪN TRƯỚC write() vì read() đã đẩy file offset đi 8 byte (nếu quên lseek lần hai sẽ ghi đè nhầm sang bản ghi idx + 1!).",
      "Khi đọc lại tổng N bản ghi ở cuối, đọc theo lô 512 bản ghi giúp giảm mạnh số lần gọi hệ thống với N = 10^5."
    ],
    "graderSpec": {
      "compileFlags": "gcc -O2 -Wall -Wextra -std=c11",
      "requiredHeaders": [
        "fcntl.h",
        "unistd.h",
        "stdint.h",
        "sys/stat.h"
      ],
      "requiredApis": [
        "open",
        "lseek",
        "read",
        "write",
        "close",
        "O_RDWR",
        "SEEK_SET"
      ],
      "forbiddenApis": [
        "fopen",
        "fread",
        "fwrite",
        "fseek"
      ],
      "qualityRules": [
        {
          "desc": "Kiểm tra kích thước tệp chia hết cho 8 (sizeof(struct Record))",
          "regex": "%\\s*(\\(\\s*off_t\\s*\\)\\s*)?(sizeof\\s*\\(\\s*struct\\s+Record\\s*\\)|8)",
          "flags": ""
        },
        {
          "desc": "Kiểm tra biên chỉ số 0 <= idx < N trước khi truy cập",
          "regex": "idx\\s*<\\s*0[\\s\\S]*idx\\s*>=\\s*\\w+",
          "flags": ""
        }
      ],
      "antiPatterns": []
    },
    "detailGuide": {
      "origin": "Chương 2 — Truy cập ngẫu nhiên bản ghi nhị phân cố định 8 byte bằng lseek() (Mục 2.6 · Đề thi cũ Câu lseek 48B/64B).",
      "lineByLine": [
        {
          "lines": "Dòng 7–10",
          "code": "struct Record { int32_t id; int32_t score; };",
          "explain": "Hai trường int32_t cố định đúng 4 + 4 = 8 byte (không có padding), khớp nhị phân với tệp của sandbox."
        },
        {
          "lines": "Dòng 23–30",
          "code": "st.st_size % sizeof(struct Record) != 0; N = st.st_size / 8;",
          "explain": "Kiểm tra kích thước tệp phải là bội số của 8; nếu lẻ byte báo lỗi -1."
        },
        {
          "lines": "Dòng 37–46",
          "code": "lseek(pos) → read(&rec) → rec.score += delta → lseek(pos) → write(&rec)",
          "explain": "CHÚ Ý: Sau khi read() 8 byte, con trỏ tệp đã tiến lên 8 byte! Bắt buộc gọi lseek(fd, pos, SEEK_SET) LẦN THỨ HAI trước write() để ghi đè đúng bản ghi idx chứ không ghi nhầm sang bản ghi idx + 1!"
        },
        {
          "lines": "Dòng 49–55",
          "code": "lseek(fd, 0, SEEK_SET); đọc lại toàn bộ N bản ghi tính tổng",
          "explain": "Đưa con trỏ về đầu tệp và cộng dồn rec.score bằng kiểu long long."
        }
      ],
      "testCases": [
        {
          "name": "Cập nhật hợp lệ & bỏ qua idx sai",
          "caseDesc": "3 bản ghi, lệnh (1,+5), (0,-3), (5,100)",
          "howHandled": "idx = 5 >= 3 bị bỏ qua bởi if (idx < 0 || idx >= N) continue; tổng còn 7+25+30=62."
        },
        {
          "name": "idx âm",
          "caseDesc": "idx = -1",
          "howHandled": "Bỏ qua an toàn nhờ idx < 0."
        },
        {
          "name": "Kích thước tệp không chia hết cho 8",
          "caseDesc": "Tệp 10 byte",
          "howHandled": "fstat kiểm tra % sizeof(struct Record) != 0 → in -1."
        },
        {
          "name": "Nhiều lệnh cộng dồn cùng 1 bản ghi",
          "caseDesc": "Cập nhật idx=0 nhiều lần",
          "howHandled": "Ghi đè trực tiếp tại pos nên lần sau đọc được đúng giá trị mới nhất."
        }
      ],
      "examRecipe": [
        "Định nghĩa struct Record { int32_t id; int32_t score; }; và mở tệp bằng O_RDWR.",
        "fstat kiểm tra st_size % 8 != 0 → in -1; tính N = st_size / 8.",
        "Mỗi lệnh (idx, delta): bỏ qua nếu idx < 0 || idx >= N; tính pos = idx * sizeof(struct Record).",
        "Nhớ gọi lseek(pos) hai lần: lseek → read → cộng delta → lseek → write.",
        "lseek về 0, đọc N bản ghi tính tổng long long, close(fd) và in."
      ]
    }
  }
];
