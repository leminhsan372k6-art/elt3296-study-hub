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
      "CR-04"
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
      "origin": "Chương 2 — Lập trình File I/O mức thấp trên Linux (Mục 2.3, 2.4, 2.5 · Lab 2 Bài 1). Trọng tâm là dùng trực tiếp bộ ba System Call POSIX open() / read() / close() để xử lý luồng byte nhị phân thô thay cho thư viện chuẩn <stdio.h>.",
      "idea": {
        "summary": "Bài toán yêu cầu đọc toàn bộ nội dung một tệp trên Linux bằng lời gọi hệ thống mức thấp (system call) để đếm 3 thông số: tổng số byte, số ký tự xuống dòng '\\n' và số chữ số ASCII '0'..'9'. Thay vì coi tệp là chuỗi văn bản kết thúc bởi '\\0', ta coi tệp là một dãy byte thô liên tiếp và đọc từng khối 4 KB vào bộ đệm cho tới khi chạm cuối tệp (EOF).",
        "steps": [
          "Bước 1 — Đọc đường dẫn tệp: Nhận chuỗi file_path từ stdin bằng scanf(\"%s\", path).",
          "Bước 2 — Mở tệp bằng System Call: Gọi open(path, O_RDONLY) để xin nhân Linux cấp một File Descriptor (fd) ở chế độ chỉ đọc; nếu fd < 0 thì in -1 và kết thúc ngay.",
          "Bước 3 — Chuẩn bị bộ đệm và bộ đếm: Khai báo mảng đệm unsigned char buf[4096] (4 KB) cùng ba biến đếm 64-bit kiểu long long (total, newlines, digits) khởi tạo bằng 0.",
          "Bước 4 — Đọc lặp từng khối đến EOF: Dùng vòng while ((n = read(fd, buf, sizeof(buf))) > 0); mỗi lần đọc thành công n byte thì cộng total += n, rồi duyệt chỉ số i từ 0 đến n - 1 để kiểm tra buf[i] == '\\n' hoặc buf[i] nằm trong ['0', '9'].",
          "Bước 5 — Giải phóng và xuất kết quả: Gọi close(fd) trả tài nguyên về cho nhân Linux, sau đó in đúng 3 số nguyên cách nhau một dấu cách."
        ],
        "whyThisWay": "Hệ thống chấm cấm dùng fopen/fread/fgets nên bắt buộc phải dùng open/read/close. Đọc theo khối 4096 byte (đúng 1 trang nhớ — page size chuẩn trên Linux) giúp giảm số lần chuyển ngữ cảnh (context switch) từ chế độ người dùng vào nhân từ hàng triệu lần xuống chỉ ~1.250 lần với tệp 5 MB. Đồng thời, duyệt đúng n byte trả về của read() trên mảng unsigned char giúp xử lý an toàn tuyệt đối tệp nhị phân có chứa byte 0x00 ('\\0') mà các hàm chuỗi như strlen() sẽ bị dừng sớm.",
        "complexity": "Thời gian: O(N) với N là số byte của tệp · Bộ nhớ: O(1) (bộ đệm tĩnh 4 KB trên Stack) · Tài nguyên OS: 1 File Descriptor"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện chuẩn và thư viện System Call POSIX",
          "code": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>",
          "explain": "<stdio.h> chỉ dùng cho nhập/xuất màn hình (scanf, printf) — tuyệt đối không dùng để mở/đọc tệp. <fcntl.h> (File Control) cung cấp khai báo hàm open() và các hằng cờ mở tệp như O_RDONLY. <unistd.h> (Unix Standard) cung cấp các lời gọi hệ thống read(), close() và kiểu dữ liệu ssize_t. Thiếu 2 header sau, trình biên dịch sẽ báo lỗi implicit declaration hoặc undeclared identifier."
        },
        {
          "lines": "Dòng 5–7",
          "title": "Khởi tạo hàm main và đọc đường dẫn tệp đầu vào",
          "code": "int main() {\n    char path[256];\n    scanf(\"%s\", path);",
          "explain": "Khai báo mảng ký tự path[256] đủ lớn để chứa đường dẫn tệp tối đa 128 ký tự theo ràng buộc đề bài (cộng dư chỗ cho ký tự kết thúc chuỗi '\\0'). Hàm scanf(\"%s\", path) đọc chuỗi đường dẫn không chứa khoảng trắng từ stdin. Không in bất kỳ dòng nhắc nào như \"Nhap ten tep:\" vì trình chấm tự động sẽ tính là sai định dạng output."
        },
        {
          "lines": "Dòng 9–13",
          "title": "Mở tệp chỉ đọc bằng open() và kiểm tra lỗi",
          "code": "int fd = open(path, O_RDONLY);\nif (fd < 0) {\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "open(path, O_RDONLY) yêu cầu nhân Linux mở tệp ở chế độ chỉ đọc (Read-Only) và trả về một số nguyên không âm gọi là File Descriptor (fd, thường là 3 vì 0/1/2 đã dành cho stdin/stdout/stderr). Nếu tệp không tồn tại hoặc không có quyền đọc, open() trả về -1. Kiểm tra if (fd < 0) là bắt buộc: nếu bỏ qua, ta sẽ truyền fd = -1 vào read() gây lỗi sai logic; ở đây ta in -1 và return 0 để chương trình kết thúc sạch theo đúng quy cách bài thi."
        },
        {
          "lines": "Dòng 15–17",
          "title": "Khai báo bộ đệm 4 KB và các biến thống kê an toàn",
          "code": "unsigned char buf[4096];\nlong long total = 0, newlines = 0, digits = 0;\nssize_t n;",
          "explain": "buf[4096] dùng kiểu unsigned char để mỗi byte luôn mang giá trị không dấu từ 0 đến 255, tránh lỗi mở rộng dấu (sign extension) với byte >= 128 khi xử lý tệp nhị phân. Ba biến đếm dùng kiểu long long (64-bit, phạm vi tới ~9×10^18) để chắc chắn không bao giờ tràn số ngay cả khi tệp lớn hơn giới hạn int. Biến n phải có kiểu ssize_t (signed size type — có dấu) chứ KHÔNG dùng size_t (không dấu), vì read() có thể trả về -1 khi gặp lỗi; nếu dùng size_t, -1 sẽ biến thành số dương khổng lồ khiến vòng lặp chạy mãi."
        },
        {
          "lines": "Dòng 19–25",
          "title": "Vòng lặp đọc theo khối bằng read() và đếm byte, dòng, chữ số",
          "code": "while ((n = read(fd, buf, sizeof(buf))) > 0) {\n    total += n;\n    for (ssize_t i = 0; i < n; i++) {\n        if (buf[i] == '\\n') newlines++;\n        else if (buf[i] >= '0' && buf[i] <= '9') digits++;\n    }\n}",
          "explain": "read(fd, buf, sizeof(buf)) yêu cầu nhân đọc tối đa 4096 byte vào buf và trả về số byte thực sự đọc được (n): n > 0 là đọc được dữ liệu (có thể nhỏ hơn 4096 gọi là short count), n == 0 là đã chạm cuối tệp (EOF), n < 0 là lỗi. Dấu ngoặc quanh (n = read(...)) rất quan trọng vì toán tử '>' có độ ưu tiên cao hơn '=' — nếu bỏ ngoặc, n chỉ nhận 0 hoặc 1! Trong thân vòng lặp, ta cộng dồn total += n và duyệt đúng i từ 0 tới n - 1: mỗi byte bằng '\\n' (mã ASCII 10) tăng newlines, còn nằm trong đoạn mã ASCII liên tiếp '0'..'9' (48..57) thì tăng digits. Cách duyệt theo chỉ số này không bị đánh lừa bởi byte '\\0' trong tệp nhị phân."
        },
        {
          "lines": "Dòng 27–30",
          "title": "Giải phóng File Descriptor, in kết quả và kết thúc",
          "code": "close(fd);\nprintf(\"%lld %lld %lld\\n\", total, newlines, digits);\nreturn 0;\n}",
          "explain": "close(fd) báo cho nhân Linux đóng tệp và giải phóng mục tương ứng trong bảng File Descriptor của tiến trình, tránh rò rỉ tài nguyên (FD leak). Sau đó in ba giá trị long long bằng định dạng %lld cách nhau đúng một dấu cách và kết thúc bằng '\\n', rồi trả về 0 báo chương trình chạy thành công."
        }
      ],
      "testCases": [
        {
          "name": "Tệp văn bản nhiều dòng tiêu chuẩn",
          "caseDesc": "Tệp f01.txt chứa đúng 20 byte: \"APT 2025\\nLine 2: 99\\n\".",
          "howHandled": "Lần đọc đầu read() trả về n = 20, cộng total = 20; vòng for đếm được 2 ký tự '\\n' và 7 chữ số ('2','0','2','5','2','9','9'). Lần đọc thứ hai trả về 0 (EOF) → thoát vòng lặp và in \"20 2 7\"."
        },
        {
          "name": "Tệp rỗng 0 byte",
          "caseDesc": "Tệp tồn tại nhưng hoàn toàn không chứa byte nào (kích thước 0 byte).",
          "howHandled": "open() vẫn trả về fd hợp lệ (>= 0). Ngay lượt đầu của while, read() trả về 0 (EOF) nên thân vòng lặp không chạy lần nào → giữ nguyên các biến bằng 0 và in \"0 0 0\"."
        },
        {
          "name": "Tệp nhị phân chứa nhiều byte '\\0' ở giữa",
          "caseDesc": "Tệp chứa 6 byte thô: {'A', 0x00, '\\n', '5', 0x00, '9'}.",
          "howHandled": "Vì ta duyệt từ i = 0 đến n - 1 dựa trên giá trị n do read() trả về (không dùng strlen hay hàm chuỗi), các byte 0x00 vẫn được tính vào total (6 byte) và không cắt cụt các byte '5', '9' phía sau → in \"6 1 2\"."
        },
        {
          "name": "Tệp không tồn tại hoặc sai đường dẫn",
          "caseDesc": "Truyền vào file_path không có trong thư mục hiện hành, ví dụ \"khong_ton_tai.dat\".",
          "howHandled": "open() trả về -1 → nhánh if (fd < 0) kích hoạt ngay lập tức, in \"-1\" và return 0 mà không gọi read() hay close()."
        }
      ],
      "examRecipe": [
        "Khai báo đúng 3 thư viện: <stdio.h>, <fcntl.h>, <unistd.h> (tuyệt đối không viết fopen/fread/fgets).",
        "Đọc path bằng scanf(\"%s\", path), gọi int fd = open(path, O_RDONLY); kiểm tra if (fd < 0) thì in -1 và return 0.",
        "Khai báo unsigned char buf[4096];, ssize_t n; và 3 biến đếm long long total = 0, newlines = 0, digits = 0;.",
        "Viết vòng lặp while ((n = read(fd, buf, sizeof(buf))) > 0) (nhớ cặp ngoặc quanh phép gán), cộng total += n rồi for (ssize_t i = 0; i < n; i++) kiểm tra '\\n' và '0'..'9'.",
        "Gọi close(fd); rồi printf(\"%lld %lld %lld\\n\", total, newlines, digits); và return 0;."
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
      "CR-04"
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
      "origin": "Chương 2 — Lập trình File I/O mức thấp: Cờ mở tệp O_APPEND, cơ chế chống short write và truy vấn kích thước bằng fstat() (Mục 2.4, 2.5, 2.7 · Lab 2 Bài 2, 4).",
      "idea": {
        "summary": "Bài toán yêu cầu nối toàn bộ nội dung tệp nguồn src_path vào cuối tệp đích dst_path bằng cờ hệ thống O_APPEND, rồi in ra tổng kích thước cuối cùng của dst_path. Đặc biệt, nếu mở tệp nguồn thất bại thì không được đụng chạm hay tạo mới tệp đích mà phải báo -1 ngay.",
        "steps": [
          "Bước 1 — Đọc hai tên tệp: Đọc src và dst từ stdin bằng scanf(\"%s %s\", src, dst).",
          "Bước 2 — Mở tệp nguồn trước tiên: Gọi open(src, O_RDONLY); nếu lỗi (fd_in < 0) thì in -1 và thoát ngay để bảo toàn nguyên trạng tệp đích.",
          "Bước 3 — Mở tệp đích ở chế độ ghi nối: Gọi open(dst, O_WRONLY | O_CREAT | O_APPEND, 0644); nếu thất bại thì nhớ close(fd_in) trước khi in -1 và thoát.",
          "Bước 4 — Đọc từng khối và ghi đủ (chống short write): Dùng vòng while đọc từng khối 4 KB từ fd_in; với mỗi khối n byte đọc được, dùng vòng while lồng bên trong gọi write() liên tục cho đến khi biến written == n.",
          "Bước 5 — Đo kích thước cuối cùng và dọn dẹp: Gọi fstat(fd_out, &st) để lấy kích thước chính xác st.st_size từ nhân Linux, đóng cả fd_in lẫn fd_out, rồi in kích thước."
        ],
        "whyThisWay": "Cờ O_APPEND đảm bảo nhân Linux tự động dịch con trỏ ghi về đúng cuối tệp một cách nguyên tử (atomic) trước mỗi lệnh write(), giúp không bao giờ ghi đè lên dữ liệu có sẵn của dst_path (kể cả khi nhiều tiến trình cùng ghi). Vòng lặp ghi phụ (while (written < n)) xử lý hiện tượng short write khi hệ điều hành ghi ít hơn số byte yêu cầu trong một lần gọi write(). Ngoài ra, mở tệp nguồn trước khi mở tệp đích giúp tránh việc cờ O_CREAT vô tình tạo ra một tệp đích rỗng khi tệp nguồn vốn không tồn tại.",
        "complexity": "Thời gian: O(N) với N là kích thước tệp nguồn · Bộ nhớ: O(1) (bộ đệm 4 KB) · Tài nguyên OS: 2 File Descriptor"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo các thư viện hệ thống cần thiết",
          "code": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>",
          "explain": "<stdio.h> dùng cho scanf/printf. <fcntl.h> cung cấp open() và các cờ O_RDONLY, O_WRONLY, O_CREAT, O_APPEND. <unistd.h> cung cấp read(), write(), close(). <sys/stat.h> định nghĩa cấu trúc struct stat và lời gọi hệ thống fstat() để lấy kích thước tệp đích sau khi nối."
        },
        {
          "lines": "Dòng 6–8",
          "title": "Đọc tên tệp nguồn và tệp đích từ bàn phím",
          "code": "int main() {\n    char src[256], dst[256];\n    scanf(\"%s %s\", src, dst);",
          "explain": "Khai báo hai mảng ký tự 256 byte để lưu đường dẫn tệp nguồn (src) và tệp đích (dst), sau đó đọc đồng thời hai chuỗi cách nhau bởi khoảng trắng từ đầu vào chuẩn."
        },
        {
          "lines": "Dòng 10–14",
          "title": "Mở tệp nguồn trước để bảo vệ tệp đích khi xảy ra lỗi",
          "code": "int fd_in = open(src, O_RDONLY);\nif (fd_in < 0) {\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Thứ tự mở tệp cực kỳ quan trọng: phải mở src trước! Nếu src không tồn tại, open() trả về -1, chương trình in -1 và thoát ngay. Nhờ vậy, tệp dst chưa hề được mở nên sẽ không bị tạo mới hay thay đổi thời gian chỉnh sửa — thỏa mãn tuyệt đối yêu cầu đề bài."
        },
        {
          "lines": "Dòng 16–21",
          "title": "Mở/tạo tệp đích ở chế độ ghi nối (O_APPEND) với quyền 0644",
          "code": "int fd_out = open(dst, O_WRONLY | O_CREAT | O_APPEND, 0644);\nif (fd_out < 0) {\n    close(fd_in);\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Phép OR bit '|' kết hợp ba cờ: O_WRONLY (chỉ ghi), O_CREAT (tự tạo tệp mới nếu dst chưa tồn tại), và O_APPEND (mọi thao tác write luôn ghi nối vào cuối tệp, KHÔNG dùng O_TRUNC vì O_TRUNC sẽ xóa sạch nội dung cũ). Tham số thứ 3 là 0644 (số bát phân có tiền tố 0): chủ sở hữu được đọc/ghi (6 = rw-), nhóm và người khác chỉ đọc (4 = r--); nếu thiếu tham số này khi có O_CREAT, quyền tệp mới tạo sẽ là giá trị rác ngẫu nhiên! Nếu mở dst lỗi, bắt buộc phải gọi close(fd_in) trước khi thoát để tránh rò rỉ File Descriptor."
        },
        {
          "lines": "Dòng 23–32",
          "title": "Đọc từng khối 4 KB và vòng lặp ghi chống short write",
          "code": "unsigned char buf[4096];\nssize_t n;\nwhile ((n = read(fd_in, buf, sizeof(buf))) > 0) {\n    ssize_t written = 0;\n    while (written < n) {\n        ssize_t w = write(fd_out, buf + written, n - written);\n        if (w <= 0) break;\n        written += w;\n    }\n}",
          "explain": "Vòng lặp ngoài đọc tối đa 4096 byte mỗi lượt vào buf cho tới khi read() trả về 0 (EOF). Với mỗi khối n byte đọc được, ta KHÔNG gọi write(fd_out, buf, n) một lần rồi thôi vì write() có thể chỉ ghi được một phần (short write). Vòng lặp trong theo dõi số byte đã ghi (written), mỗi lần truyền con trỏ dịch tới vị trí chưa ghi (buf + written) và số byte còn lại (n - written), cộng dồn written += w cho tới khi ghi trọn vẹn đủ n byte. Kiểm tra if (w <= 0) break tránh vòng lặp vô hạn nếu đĩa đầy hoặc gặp lỗi ghi."
        },
        {
          "lines": "Dòng 34–35",
          "title": "Truy vấn kích thước cuối cùng của tệp đích bằng fstat()",
          "code": "struct stat st;\nfstat(fd_out, &st);",
          "explain": "fstat(fd_out, &st) đọc siêu dữ liệu trực tiếp từ File Descriptor fd_out đang mở và điền vào biến cấu trúc st. Trường st.st_size lưu tổng kích thước hiện tại (tính bằng byte) của tệp đích, bao gồm cả dữ liệu cũ có sẵn trước đó lẫn phần dữ liệu mới vừa nối thêm. Dùng fstat() nhanh và chính xác hơn việc tự cộng thủ công hoặc gọi lại stat() theo tên tệp."
        },
        {
          "lines": "Dòng 37–41",
          "title": "Đóng cả hai File Descriptor và in kích thước tệp đích",
          "code": "close(fd_in);\nclose(fd_out);\nprintf(\"%lld\\n\", (long long)st.st_size);\nreturn 0;\n}",
          "explain": "Đóng lần lượt cả fd_in và fd_out để trả tài nguyên cho hệ điều hành. Vì st.st_size có kiểu off_t (kích thước phụ thuộc kiến trúc 32-bit hay 64-bit), ta ép kiểu tường minh sang (long long) khớp với định dạng %lld trong printf() để tránh cảnh báo biên dịch và lỗi in sai trên mọi hệ thống Linux."
        }
      ],
      "testCases": [
        {
          "name": "Nối vào tệp đích đã có sẵn nội dung",
          "caseDesc": "dst02.txt chứa \"HELLO\" (5 byte), src02.txt chứa \"_LINUX\" (6 byte).",
          "howHandled": "O_APPEND giữ nguyên \"HELLO\" và nối \"_LINUX\" vào cuối thành \"HELLO_LINUX\". fstat() trả về st.st_size = 11 → in 11."
        },
        {
          "name": "Tệp đích chưa tồn tại trước khi chạy",
          "caseDesc": "src02.txt có 100 byte, dst_new.bin chưa hề có trên đĩa.",
          "howHandled": "Cờ O_CREAT kèm mode 0644 tự động tạo mới dst_new.bin, ghi toàn bộ 100 byte từ nguồn sang và in 100."
        },
        {
          "name": "Tệp nguồn rỗng 0 byte (hoặc chứa byte nhị phân '\\0')",
          "caseDesc": "dst02.txt có sẵn 50 byte, src_empty.bin có 0 byte (hoặc chứa byte 0x00).",
          "howHandled": "Nếu nguồn rỗng, vòng while read() không chạy lần nào, nội dung 50 byte cũ của đích giữ nguyên → fstat() trả về 50. Nếu có byte 0x00, write() ghi theo đúng số byte n nên bảo toàn nguyên vẹn từng byte nhị phân."
        },
        {
          "name": "Tệp nguồn không tồn tại",
          "caseDesc": "src_path không tồn tại, dst_path chưa tồn tại hoặc đang chứa \"SAFE\".",
          "howHandled": "open(src, O_RDONLY) thất bại trước khi chạm vào dst → in -1 và thoát ngay; dst giữ nguyên \"SAFE\" (hoặc không bị tạo mới)."
        }
      ],
      "examRecipe": [
        "Khai báo 4 thư viện: <stdio.h>, <fcntl.h>, <unistd.h>, <sys/stat.h>.",
        "Đọc src, dst rồi MỞ NGUỒN TRƯỚC: fd_in = open(src, O_RDONLY); nếu < 0 in -1 và thoát ngay.",
        "Mở đích với đủ 3 cờ và quyền 0644: fd_out = open(dst, O_WRONLY | O_CREAT | O_APPEND, 0644); nếu lỗi nhớ close(fd_in) trước khi in -1.",
        "Viết vòng while read(fd_in, buf, sizeof(buf)) > 0 bọc vòng while (written < n) gọi write(fd_out, buf + written, n - written) để chống short write.",
        "Gọi fstat(fd_out, &st), đóng cả fd_in và fd_out, in (long long)st.st_size bằng %lld."
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
      "CR-07"
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
      "origin": "Chương 2 — Truy xuất siêu dữ liệu (Metadata) của tệp từ Inode bằng lời gọi hệ thống stat() (Mục 2.7 · Lab 2 Bài 3 · Dạng bài sát đề thi thật Câu 21).",
      "idea": {
        "summary": "Mỗi tệp hay thư mục trong Linux đều có một cấu trúc inode lưu toàn bộ siêu dữ liệu (loại tệp, kích thước, quyền truy cập, chủ sở hữu, mốc thời gian...). Bài toán yêu cầu dùng stat() để đọc inode đó vào biến struct stat, sau đó dùng các macro chuẩn để phân loại đối tượng (REG / DIR / OTHER) và tách 9 bit quyền truy cập cuối cùng để in ở hệ cơ số 8 (octal) gồm đúng 3 chữ số.",
        "steps": [
          "Bước 1 — Đọc đường dẫn: Nhận chuỗi path từ stdin bằng scanf(\"%s\", path).",
          "Bước 2 — Gọi lời gọi hệ thống stat(): Khai báo struct stat st và gọi stat(path, &st); nếu kết quả trả về là -1 (không tồn tại hoặc không có quyền truy cập) thì in -1 và kết thúc.",
          "Bước 3 — Xác định loại đối tượng: Kiểm tra trường st.st_mode bằng macro S_ISREG(st.st_mode) → in \"REG \", S_ISDIR(st.st_mode) → in \"DIR \", các trường hợp còn lại (FIFO, socket, device...) → in \"OTHER \".",
          "Bước 4 — Trích xuất kích thước và quyền 3 chữ số octal: Ép st.st_size sang (long long), dùng phép AND bit (st.st_mode & 0777) để lọc đúng 9 bit quyền rwx của User/Group/Other, rồi in bằng định dạng \"%lld %03o\\n\"."
        ],
        "whyThisWay": "Trường st.st_mode trong Linux là một trường bit (bitmask) chứa ĐỒNG THỜI cả loại tệp (4 bit cao) lẫn quyền truy cập (12 bit thấp, trong đó 9 bit cuối là quyền rwx). Vì vậy ta KHÔNG thể so sánh trực tiếp st.st_mode với một hằng số đơn lẻ mà phải dùng macro chuẩn POSIX như S_ISREG/S_ISDIR để kiểm tra loại, và dùng phép mặt nạ bit (& 0777) để cắt bỏ các bit loại tệp và special bit trước khi in quyền. Định dạng %03o đảm bảo quyền như 0044 hay 0000 vẫn in đủ 3 chữ số (044, 000) chứ không bị mất số 0 đầu.",
        "complexity": "Thời gian: O(1) (chỉ 1 lời gọi hệ thống đọc inode, không đọc nội dung tệp) · Bộ nhớ: O(1) · Tài nguyên OS: 0 File Descriptor"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện I/O chuẩn và siêu dữ liệu tệp (<sys/stat.h>)",
          "code": "#include <stdio.h>\n#include <sys/stat.h>\n#include <unistd.h>",
          "explain": "<stdio.h> dùng cho scanf/printf. <sys/stat.h> là thư viện cốt lõi của bài này: nó định nghĩa cấu trúc struct stat, hàm stat(), và các macro phân loại tệp S_ISREG(), S_ISDIR(). <unistd.h> là header chuẩn POSIX đi kèm các thao tác hệ thống trên Linux."
        },
        {
          "lines": "Dòng 5–7",
          "title": "Khai báo mảng đường dẫn và đọc input",
          "code": "int main() {\n    char path[300];\n    scanf(\"%s\", path);",
          "explain": "Đề bài cho độ dài path tối đa 256 ký tự nên ta cấp mảng char path[300] cho rộng rãi (tránh tràn bộ đệm buffer overflow khi gặp chuỗi dài sát 256 ký tự + '\\0'). Đọc đường dẫn trực tiếp từ stdin mà không in lời nhắc."
        },
        {
          "lines": "Dòng 9–13",
          "title": "Gọi stat() để lấy siêu dữ liệu từ inode và kiểm tra lỗi",
          "code": "struct stat st;\nif (stat(path, &st) == -1) {\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Khai báo biến cấu trúc struct stat st để nhân Linux chép thông tin inode vào. Lưu ý truyền địa chỉ &st làm đối số thứ hai. stat() không cần mở tệp bằng open() (do đó không cần close()). Nếu thành công, stat() trả về 0; nếu đường dẫn không tồn tại, là symlink hỏng, hoặc không có quyền duyệt thư mục cha, stat() trả về -1 → ta in -1 và kết thúc ngay."
        },
        {
          "lines": "Dòng 15–21",
          "title": "Phân loại đối tượng tệp bằng macro S_ISREG và S_ISDIR",
          "code": "if (S_ISREG(st.st_mode)) {\n    printf(\"REG \");\n} else if (S_ISDIR(st.st_mode)) {\n    printf(\"DIR \");\n} else {\n    printf(\"OTHER \");\n}",
          "explain": "Các bit cao trong st.st_mode mã hóa loại đối tượng. Macro S_ISREG(st.st_mode) kiểm tra xem đối tượng có phải tệp thông thường (Regular File) không; S_ISDIR(st.st_mode) kiểm tra có phải thư mục (Directory) không. Các loại còn lại như FIFO (named pipe), socket, tệp thiết bị khối/ký tự rơi vào nhánh else in \"OTHER \". Chú ý dấu cách ở cuối mỗi chuỗi để ngăn cách với kích thước ở lệnh printf tiếp theo."
        },
        {
          "lines": "Dòng 23–25",
          "title": "Trích xuất kích thước, tách 9 bit quyền bằng mặt nạ 0777 và in hệ bát phân",
          "code": "printf(\"%lld %03o\\n\", (long long)st.st_size, st.st_mode & 0777);\nreturn 0;\n}",
          "explain": "st.st_size (kiểu off_t) là kích thước tệp theo byte, được ép sang (long long) để khớp %lld. Phép toán bit st.st_mode & 0777 cực kỳ quan trọng: số 0777 có chữ số '0' ở đầu nên là hằng hệ bát phân (octal), tương ứng với 9 bit 1 liên tiếp (111 111 111 trong nhị phân) — nó giữ lại đúng 9 bit quyền rwx của chủ sở hữu, nhóm và người khác, đồng thời xóa sạch các bit loại tệp phía trên. Nếu viết nhầm thành & 777 (hệ thập phân) thì kết quả sẽ sai hoàn toàn! Cuối cùng, %03o in số nguyên ở hệ cơ số 8 (octal) với độ rộng tối thiểu 3 ký tự và tự đệm số '0' ở đầu nếu cần (ví dụ 0644 → \"644\", 0064 → \"064\")."
        }
      ],
      "testCases": [
        {
          "name": "Tệp thường có quyền chuẩn 0644",
          "caseDesc": "Tệp meta03.bin kích thước 128 byte, quyền rw-r--r-- (0644).",
          "howHandled": "stat() trả về 0, S_ISREG đúng → in \"REG \"; st.st_size = 128 và (st.st_mode & 0777) ở hệ 8 là 644 → output \"REG 128 644\"."
        },
        {
          "name": "Thư mục có quyền 0755 hoặc tệp quyền thấp 0044",
          "caseDesc": "Đường dẫn là thư mục rwxr-xr-x (0755) hoặc tệp chỉ có quyền 0044 (chủ không có quyền, nhóm & khác chỉ đọc).",
          "howHandled": "Với thư mục, S_ISDIR đúng → in \"DIR <size> 755\". Với quyền 0044, định dạng %03o giữ nguyên số 0 đầu tiên → in \"044\" thay vì \"44\"."
        },
        {
          "name": "Tệp rỗng 0 byte hoặc tệp đặc biệt (FIFO / named pipe)",
          "caseDesc": "Tệp thường 0 byte quyền 0600, hoặc đường dẫn trỏ tới một FIFO tạo bằng mkfifo.",
          "howHandled": "Tệp 0 byte in \"REG 0 600\". Với FIFO, cả S_ISREG và S_ISDIR đều sai → rơi vào nhánh else in \"OTHER 0 <perm>\"."
        },
        {
          "name": "Đường dẫn không tồn tại",
          "caseDesc": "Nhập đường dẫn sai như \"/tmp/no_such_file_xyz\".",
          "howHandled": "stat() trả về -1 → nhánh kiểm tra lỗi in \"-1\" và return 0 ngay lập tức."
        }
      ],
      "examRecipe": [
        "Khai báo 3 header: <stdio.h>, <sys/stat.h>, <unistd.h>.",
        "Đọc path vào mảng char path[300], khai báo struct stat st; rồi gọi if (stat(path, &st) == -1) in -1 và return 0.",
        "Phân loại bằng chuỗi if / else if / else với S_ISREG(st.st_mode) → \"REG \", S_ISDIR(st.st_mode) → \"DIR \", else → \"OTHER \".",
        "Nhớ quy tắc vàng của quyền Linux: luôn viết st.st_mode & 0777 (CÓ số 0 ở đầu là hệ bát phân) và in bằng %03o (đủ 3 chữ số).",
        "Ép kiểu (long long)st.st_size cho %lld trong cùng một dòng printf(\"%lld %03o\\n\", ...) rồi return 0."
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
      "CR-08"
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
      "origin": "Chương 2 — Định vị con trỏ tệp bằng lseek() kết hợp vòng lặp đọc/ghi có giới hạn số byte (Mục 2.5, 2.6 · Lab 2 Bài 1b).",
      "idea": {
        "summary": "Bài toán yêu cầu cắt (trích xuất) một đoạn dữ liệu dài tối đa max_bytes byte từ tệp nguồn src_path bắt đầu tại vị trí byte thứ offset, rồi ghi đè toàn bộ trích đoạn đó vào tệp đích dst_path. Thay vì đọc bỏ từng byte từ đầu tệp, ta dùng lseek() nhảy thẳng con trỏ đọc tới offset, sau đó đọc từng phần sao cho không bao giờ vượt quá max_bytes.",
        "steps": [
          "Bước 1 — Đọc và kiểm tra đầu vào: Nhận src, dst, offset, max_bytes (dùng long long cho offset và max_bytes); nếu offset < 0 thì báo lỗi in -1 và kết thúc ngay.",
          "Bước 2 — Mở tệp nguồn và tệp đích: Mở src bằng O_RDONLY (nếu lỗi in -1 và thoát trước khi đụng vào dst); sau đó mở dst bằng O_WRONLY | O_CREAT | O_TRUNC với quyền 0644 (nếu lỗi thì close(fd_in) rồi in -1).",
          "Bước 3 — Nhảy con trỏ đọc tới offset: Gọi lseek(fd_in, (off_t)offset, SEEK_SET) để đặt vị trí đọc hiện hành cách đầu tệp đúng offset byte.",
          "Bước 4 — Đọc/ghi có kiểm soát giới hạn: Lặp khi copied < max_bytes; mỗi lượt tính remain = max_bytes - copied và chỉ xin read() tối đa chunk = min(remain, sizeof(buf)) byte. Nếu read() trả về <= 0 (chạm EOF sớm) thì dừng ngay; ngược lại dùng vòng lặp ghi chống short write để ghi đủ n byte sang fd_out và cộng copied += n.",
          "Bước 5 — Dọn dẹp và báo kết quả: Đóng cả fd_in và fd_out, in ra tổng số byte thực tế đã sao chép (copied)."
        ],
        "whyThisWay": "Dùng lseek(fd_in, offset, SEEK_SET) nhảy thẳng đến vị trí cần đọc trong thời gian O(1) mà không tốn công đọc bỏ phần đầu tệp. Khi mở tệp đích, ta BẮT BUỘC dùng cờ O_TRUNC (cắt ngắn về 0 byte) chứ không dùng O_APPEND, vì nếu tệp đích đã tồn tại với nội dung cũ dài hơn thì dữ liệu cũ thừa ra sẽ làm sai nội dung tệp kết quả. Việc giới hạn tham số thứ 3 của read() là min(remain, 4096) đảm bảo ta không bao giờ đọc lố quá max_bytes.",
        "complexity": "Thời gian: O(min(max_bytes, file_size - offset)) · Bộ nhớ: O(1) (bộ đệm 4 KB) · Tài nguyên OS: 2 File Descriptor"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–3",
          "title": "Khai báo thư viện stdio và các lời gọi hệ thống tệp",
          "code": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>",
          "explain": "<stdio.h> dùng cho scanf/printf. <fcntl.h> cung cấp open() cùng các cờ O_RDONLY, O_WRONLY, O_CREAT, O_TRUNC. <unistd.h> cung cấp lseek(), hằng SEEK_SET, read(), write(), close() và các kiểu dữ liệu off_t, ssize_t."
        },
        {
          "lines": "Dòng 5–13",
          "title": "Đọc tham số đầu vào và kiểm tra tính hợp lệ của offset",
          "code": "int main() {\n    char src[256], dst[256];\n    long long offset, max_bytes;\n    scanf(\"%s %s %lld %lld\", src, dst, &offset, &max_bytes);\n    if (offset < 0) { printf(\"-1\\n\"); return 0; }",
          "explain": "Dùng kiểu long long cho offset và max_bytes để an toàn với giá trị lớn và khớp đặc tả %lld. Kiểm tra if (offset < 0) ngay từ đầu vì lseek(..., SEEK_SET) với độ dời âm là không hợp lệ (trả về lỗi EINVAL); chặn sớm giúp ta in -1 mà không tạo ra hay xóa nhầm tệp đích."
        },
        {
          "lines": "Dòng 15–19",
          "title": "Mở tệp nguồn ở chế độ chỉ đọc (O_RDONLY)",
          "code": "int fd_in = open(src, O_RDONLY);\nif (fd_in < 0) {\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Luôn mở tệp nguồn trước tệp đích. Nếu tệp nguồn không tồn tại, fd_in < 0 → in -1 và thoát ngay, không làm ảnh hưởng gì đến tệp đích dst."
        },
        {
          "lines": "Dòng 21–26",
          "title": "Mở/tạo mới tệp đích và xóa sạch nội dung cũ bằng O_TRUNC",
          "code": "int fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\nif (fd_out < 0) {\n    close(fd_in);\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Bộ ba cờ kinh điển để ghi đè hoàn toàn một tệp mới: O_WRONLY (chỉ ghi), O_CREAT (tạo nếu chưa có), và O_TRUNC (nếu tệp đã tồn tại thì cắt kích thước về 0 byte ngay lập tức để xóa sạch nội dung cũ). Quyền tạo tệp là 0644 (rw-r--r--). Nếu mở dst thất bại, phải gọi close(fd_in) trước khi return để không rò rỉ FD."
        },
        {
          "lines": "Dòng 28",
          "title": "Định vị con trỏ đọc tới đúng byte thứ offset bằng lseek()",
          "code": "lseek(fd_in, (off_t)offset, SEEK_SET);",
          "explain": "lseek() dịch chuyển con trỏ vị trí tệp (file offset) của fd_in trong bảng mô tả tệp của nhân Linux. Hằng SEEK_SET có nghĩa là tính mốc từ đầu tệp (byte 0). Ép kiểu (off_t)offset cho khớp chữ ký hàm POSIX. Điều thú vị của Linux: nếu offset lớn hơn hẳn kích thước tệp nguồn, lseek() vẫn thành công (đặt con trỏ vượt quá EOF), và ngay lần gọi read() đầu tiên sẽ trả về 0 — nhờ đó chương trình tự động tạo tệp đích 0 byte và in 0 đúng yêu cầu!"
        },
        {
          "lines": "Dòng 30–45",
          "title": "Vòng lặp đọc có giới hạn chunk và ghi đủ n byte sang tệp đích",
          "code": "unsigned char buf[4096];\nlong long copied = 0;\nwhile (copied < max_bytes) {\n    long long remain = max_bytes - copied;\n    size_t chunk = (remain < (long long)sizeof(buf)) ? (size_t)remain : sizeof(buf);\n    ssize_t n = read(fd_in, buf, chunk);\n    if (n <= 0) break;\n    ssize_t written = 0;\n    while (written < n) {\n        ssize_t w = write(fd_out, buf + written, n - written);\n        if (w <= 0) break;\n        written += w;\n    }\n    copied += n;\n}",
          "explain": "Đây là trái tim của bài toán: mỗi vòng lặp ta tính số byte còn thiếu remain = max_bytes - copied. Nếu remain nhỏ hơn 4096, ta chỉ đọc đúng chunk = remain byte để không đọc thừa sang phần sau; nếu remain >= 4096 thì đọc tròn 4096 byte. Khi read() trả về 0 (chạm EOF của tệp nguồn trước khi đủ max_bytes) hoặc < 0, lệnh if (n <= 0) break dừng vòng lặp ngay. Tiếp theo, vòng while (written < n) đảm bảo ghi trọn vẹn n byte sang fd_out bất chấp short write, rồi cập nhật copied += n."
        },
        {
          "lines": "Dòng 47–51",
          "title": "Đóng cả hai tệp, in tổng số byte thực tế đã sao chép",
          "code": "close(fd_in);\nclose(fd_out);\nprintf(\"%lld\\n\", copied);\nreturn 0;\n}",
          "explain": "Giải phóng cả hai File Descriptor cho hệ điều hành, in ra số byte thực sự đã sao chép copied (có thể nhỏ hơn max_bytes nếu tệp nguồn hết sớm, hoặc bằng 0 nếu offset >= kích thước nguồn hay max_bytes == 0) rồi thoát."
        }
      ],
      "testCases": [
        {
          "name": "Trích đoạn bình thường nằm giữa tệp",
          "caseDesc": "src chứa \"Hello Linux File IO!\" (20 byte), offset = 6, max_bytes = 5.",
          "howHandled": "lseek() nhảy tới byte thứ 6 ('L'). Vòng lặp đặt chunk = min(5, 4096) = 5, đọc đúng \"Linux\", ghi vào dst và thoát khi copied == 5 → in 5."
        },
        {
          "name": "offset vượt quá kích thước tệp nguồn hoặc max_bytes = 0",
          "caseDesc": "src dài 20 byte nhưng truyền offset = 100, max_bytes = 50 (hoặc offset = 0, max_bytes = 0).",
          "howHandled": "Với offset = 100, lseek() đặt con trỏ quá EOF → read() trả về 0 ngay lần đầu → break, dst là tệp rỗng 0 byte, in 0. Với max_bytes = 0, vòng while (0 < 0) không chạy → dst rỗng và in 0."
        },
        {
          "name": "max_bytes lớn hơn phần dữ liệu còn lại của tệp",
          "caseDesc": "src dài 20 byte, offset = 15, max_bytes = 1000.",
          "howHandled": "Lượt 1 read() đọc được đúng 5 byte còn lại (\"e IO!\"), ghi sang dst, copied = 5. Lượt 2 read() trả về 0 (EOF) → break → in 5."
        },
        {
          "name": "offset âm hoặc tệp nguồn không tồn tại",
          "caseDesc": "Truyền offset = -5 hoặc tên src không tồn tại.",
          "howHandled": "Bị chặn bởi if (offset < 0) hoặc if (fd_in < 0) trước khi mở tệp đích → in -1 và thoát ngay."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <fcntl.h>, <unistd.h>; đọc src, dst và hai số long long offset, max_bytes.",
        "Kiểm tra if (offset < 0) in -1 và thoát ngay; mở nguồn bằng O_RDONLY, mở đích bằng O_WRONLY | O_CREAT | O_TRUNC, 0644 (nhớ close(fd_in) nếu mở đích lỗi).",
        "Gọi lseek(fd_in, (off_t)offset, SEEK_SET); để nhảy thẳng tới vị trí bắt đầu trích xuất.",
        "Trong vòng while (copied < max_bytes), tính chunk = min(max_bytes - copied, sizeof(buf)), gọi read(fd_in, buf, chunk), dừng nếu n <= 0, và dùng vòng lặp while (written < n) để write() hết n byte.",
        "Cộng copied += n; kết thúc vòng lặp thì close() cả hai FD và printf(\"%lld\\n\", copied)."
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
      "CR-08"
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
      "origin": "Chương 2 — Kết hợp lseek(SEEK_END) và lseek(SEEK_SET) để đọc lùi tệp nhị phân theo khối có kích thước buf_size (Mục 2.6 · Kỹ thuật quản lý con trỏ tệp nâng cao).",
      "idea": {
        "summary": "Để đảo ngược thứ tự toàn bộ byte của một tệp nhị phân kích thước lớn mà không cần nạp cả tệp vào RAM, ta chia tệp thành các khối có kích thước tối đa buf_size và đi giật lùi từ cuối tệp về đầu tệp. Với mỗi khối đọc được ở cuối, ta đảo ngược thứ tự các byte ngay trong mảng đệm rồi ghi nối tiếp vào tệp đích.",
        "steps": [
          "Bước 1 — Đọc và kiểm tra đầu vào: Nhận src, dst và buf_size; nếu buf_size <= 0 thì in -1 và kết thúc ngay.",
          "Bước 2 — Mở tệp nguồn và tạo tệp đích: Mở src (O_RDONLY) trước, sau đó mở dst (O_WRONLY | O_CREAT | O_TRUNC, 0644) với đầy đủ kiểm tra lỗi.",
          "Bước 3 — Xác định kích thước tệp & cấp phát bộ đệm: Gọi file_size = lseek(fd_in, 0, SEEK_END) để biết tổng số byte của tệp nguồn; cấp phát động mảng buf kích thước buf_size bằng malloc() và đặt con trỏ lùi pos = file_size.",
          "Bước 4 — Vòng lặp đọc lùi, đảo khối, ghi tiến: Chừng nào pos > 0, lấy chunk = min(pos, buf_size), lùi pos -= chunk, gọi lseek(fd_in, pos, SEEK_SET) rồi đọc đủ chunk byte vào buf; đảo ngược buf[0..got-1] tại chỗ bằng hai chỉ số đầu-cuối; ghi đủ got byte vào fd_out và cộng total += got.",
          "Bước 5 — Dọn dẹp tài nguyên: Giải phóng bộ đệm bằng free(buf), đóng fd_in và fd_out, rồi in ra tổng số byte đã đảo ngược."
        ],
        "whyThisWay": "Nếu nạp cả tệp vào RAM sẽ tốn bộ nhớ O(N) và dễ tràn bộ nhớ với tệp rất lớn; ngược lại nếu lseek() từng 1 byte từ cuối về đầu sẽ gây ra hàng triệu lời gọi hệ thống cực kỳ chậm. Đọc lùi từng khối buf_size byte kết hợp đảo ngược khối trong RAM giúp vừa đạt bộ nhớ tối ưu O(buf_size) vừa giảm số lần gọi lseek/read/write xuống N / buf_size lần. Quy luật toán học: đảo ngược chuỗi [Khối 1][Khối 2][Khối 3] chính bằng [đảo(Khối 3)][đảo(Khối 2)][đảo(Khối 1)].",
        "complexity": "Thời gian: O(N) (mỗi byte được đọc 1 lần, hoán đổi 1 lần, ghi 1 lần) · Bộ nhớ: O(buf_size) trên Heap · Tài nguyên OS: 2 File Descriptor"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện I/O, cấp phát động (<stdlib.h>) và System Call",
          "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <fcntl.h>\n#include <unistd.h>",
          "explain": "Ngoài 3 thư viện quen thuộc cho File I/O (<stdio.h>, <fcntl.h>, <unistd.h>), bài này cần thêm <stdlib.h> để sử dụng malloc() và free() cấp phát động bộ đệm đúng bằng buf_size nhập vào lúc chạy chương trình."
        },
        {
          "lines": "Dòng 6–14",
          "title": "Đọc tham số và chặn sớm lỗi buf_size <= 0",
          "code": "int main() {\n    char src[256], dst[256];\n    int buf_size;\n    scanf(\"%s %s %d\", src, dst, &buf_size);\n    if (buf_size <= 0) { printf(\"-1\\n\"); return 0; }",
          "explain": "Đọc đường dẫn nguồn, đích và kích thước khối buf_size. Kiểm tra buf_size <= 0 ngay đầu hàm main để tránh truyền số âm hoặc 0 vào malloc() và vòng lặp chia khối (có thể gây lỗi cấp phát hoặc lặp vô hạn), đồng thời không tạo tệp đích rác."
        },
        {
          "lines": "Dòng 16–27",
          "title": "Mở tệp nguồn (O_RDONLY) và tạo/làm rỗng tệp đích (O_TRUNC)",
          "code": "int fd_in = open(src, O_RDONLY);\nif (fd_in < 0) { printf(\"-1\\n\"); return 0; }\nint fd_out = open(dst, O_WRONLY | O_CREAT | O_TRUNC, 0644);\nif (fd_out < 0) { close(fd_in); printf(\"-1\\n\"); return 0; }",
          "explain": "Mở nguồn ở chế độ chỉ đọc trước; nếu thất bại in -1 và thoát. Tiếp theo mở đích bằng O_WRONLY | O_CREAT | O_TRUNC với quyền 0644 để tạo mới hoặc xóa nội dung cũ. Nếu mở đích thất bại, bắt buộc close(fd_in) trước khi return."
        },
        {
          "lines": "Dòng 29–33",
          "title": "Đo kích thước tệp bằng lseek(SEEK_END), cấp phát bộ đệm động và khởi tạo vị trí lùi",
          "code": "off_t file_size = lseek(fd_in, 0, SEEK_END);\nunsigned char *buf = (unsigned char *)malloc(buf_size);\noff_t pos = file_size;\nlong long total = 0;",
          "explain": "lseek(fd_in, 0, SEEK_END) di chuyển con trỏ đến vị trí cách cuối tệp 0 byte và trả về chính xác kích thước tệp (kiểu off_t). Cấp phát mảng động unsigned char kích thước buf_size trên Heap để chứa dữ liệu nhị phân thô (tránh stack overflow nếu buf_size lớn tới 64 KB). Biến pos đánh dấu ranh giới bên phải chưa xử lý, khởi đầu bằng file_size; nếu tệp rỗng (file_size == 0), vòng while sau sẽ tự bỏ qua hoàn toàn."
        },
        {
          "lines": "Dòng 35–45",
          "title": "Tính kích thước khối lùi, định vị bằng lseek(SEEK_SET) và vòng lặp đọc đủ chunk byte",
          "code": "while (pos > 0) {\n    int chunk = (pos >= buf_size) ? buf_size : (int)pos;\n    pos -= chunk;\n    lseek(fd_in, pos, SEEK_SET);\n    int got = 0;\n    while (got < chunk) {\n        ssize_t n = read(fd_in, buf + got, chunk - got);\n        if (n <= 0) break;\n        got += n;\n    }",
          "explain": "Ở mỗi lượt khi pos > 0: nếu phần còn lại >= buf_size ta lấy trọn buf_size byte, ngược lại (khối đầu tệp bị lẻ) ta chỉ lấy đúng pos byte. Ta trừ pos -= chunk để ra vị trí bắt đầu của khối, rồi gọi lseek(fd_in, pos, SEEK_SET) nhảy thẳng đến đó. Vòng while (got < chunk) bảo vệ trước trường hợp short read: đọc lặp vào buf + got đến khi gom đủ đúng chunk byte."
        },
        {
          "lines": "Dòng 47–51",
          "title": "Đảo ngược mảng byte tại chỗ trong bộ đệm bằng kỹ thuật hai đầu",
          "code": "    for (int i = 0; i < got / 2; i++) {\n        unsigned char tmp = buf[i];\n        buf[i] = buf[got - 1 - i];\n        buf[got - 1 - i] = tmp;\n    }",
          "explain": "Hoán đổi cặp đối xứng buf[i] với buf[got - 1 - i] khi i chạy từ 0 đến got / 2 - 1 (nếu chạy tới got sẽ đảo 2 lần thành y như cũ!). Nhờ đảo tại chỗ trên mảng unsigned char với đúng chiều dài got, mọi byte nhị phân (kể cả '\\0' hay 0xFF) đều được đảo chính xác mà không tốn thêm mảng phụ."
        },
        {
          "lines": "Dòng 53–60",
          "title": "Vòng lặp ghi đủ toàn bộ khối đã đảo sang tệp đích và cộng dồn total",
          "code": "    int written = 0;\n    while (written < got) {\n        ssize_t w = write(fd_out, buf + written, got - written);\n        if (w <= 0) break;\n        written += w;\n    }\n    total += got;\n}",
          "explain": "Ghi nối tiếp khối vừa đảo vào tệp đích bằng vòng lặp chống short write (while (written < got)). Vì tệp đích mở bình thường không cần lseek lại, mỗi khối đã đảo từ cuối nguồn sẽ lần lượt xuất hiện ở đầu đích, tạo nên tệp đảo ngược hoàn chỉnh. Cuối lượt cộng dồn total += got."
        },
        {
          "lines": "Dòng 62–67",
          "title": "Giải phóng bộ nhớ Heap, đóng cả hai File Descriptor và in kết quả",
          "code": "free(buf);\nclose(fd_in);\nclose(fd_out);\nprintf(\"%lld\\n\", total);\nreturn 0;\n}",
          "explain": "Trả lại vùng nhớ đã xin bằng malloc() thông qua free(buf) để không rò rỉ bộ nhớ (memory leak), đóng cả fd_in và fd_out để xả dữ liệu và trả FD về cho nhân Linux, sau đó in tổng số byte đã xử lý total."
        }
      ],
      "testCases": [
        {
          "name": "Kích thước tệp không chia hết cho buf_size",
          "caseDesc": "src chứa 6 byte \"ABCDE\\n\", buf_size = 4.",
          "howHandled": "Lượt 1: pos từ 6 lùi 4 → pos = 2, đọc 4 byte \"CDE\\n\", đảo thành \"\\nEDC\", ghi ra đích. Lượt 2: pos = 2 < 4 → chunk = 2, lùi về pos = 0, đọc \"AB\", đảo thành \"BA\", ghi nối → đích chứa \"\\nEDCBA\", in 6."
        },
        {
          "name": "Tệp nhị phân chứa byte 0x00 và 0xFF (hoặc buf_size = 1)",
          "caseDesc": "src chứa {0x00, 0x41, 0xFF, 0x00} và buf_size = 1 hoặc 2.",
          "howHandled": "Thao tác hoàn toàn trên unsigned char theo số lượng byte got, không đụng hàm chuỗi → đích chứa đúng {0x00, 0xFF, 0x41, 0x00}, in 4."
        },
        {
          "name": "Tệp nguồn rỗng 0 byte",
          "caseDesc": "src có kích thước 0 byte, buf_size = 4096.",
          "howHandled": "file_size = lseek(fd_in, 0, SEEK_END) trả về 0 → pos = 0 → vòng while (pos > 0) không chạy, tệp đích được tạo rỗng 0 byte, giải phóng buf và in 0."
        },
        {
          "name": "Tham số buf_size <= 0 hoặc tệp nguồn không tồn tại",
          "caseDesc": "Truyền buf_size = 0 (hoặc -16) hay đường dẫn src không tồn tại.",
          "howHandled": "Các lệnh kiểm tra ở dòng 11 và dòng 17 bắt lỗi ngay trước khi tạo tệp đích → in -1 và thoát sạch."
        }
      ],
      "examRecipe": [
        "Khai báo 4 thư viện: <stdio.h>, <stdlib.h>, <fcntl.h>, <unistd.h>; đọc src, dst, buf_size và chặn ngay if (buf_size <= 0) in -1.",
        "Mở nguồn (O_RDONLY) trước, mở đích (O_WRONLY | O_CREAT | O_TRUNC, 0644) sau; lỗi thì dọn FD và in -1.",
        "Đo kích thước bằng off_t file_size = lseek(fd_in, 0, SEEK_END); cấp phát unsigned char *buf = malloc(buf_size); đặt pos = file_size.",
        "Trong vòng while (pos > 0): tính chunk = min(pos, buf_size), giảm pos -= chunk, gọi lseek(fd_in, pos, SEEK_SET), đọc đủ chunk byte, đảo mảng for (i = 0; i < got/2; i++), rồi ghi đủ got byte sang fd_out.",
        "Gọi free(buf), close(fd_in), close(fd_out) và in total bằng %lld."
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
      "CR-03"
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
      "origin": "Chương 2 — Duyệt danh mục thư mục Linux bằng bộ API <dirent.h> kết hợp ghép đường dẫn đầy đủ và kiểm tra tệp thường S_ISREG qua stat() (Mục 2.8 · Lab 2 Bài 6, 7).",
      "idea": {
        "summary": "Bài toán yêu cầu duyệt tất cả các mục nằm trực tiếp bên trong một thư mục (không đệ quy vào thư mục con), lọc ra các tệp thông thường (regular file) có tên kết thúc chính xác bằng chuỗi hậu tố ext (phân biệt chữ hoa/thường), rồi đếm tổng số tệp và cộng tổng kích thước (byte) của chúng.",
        "steps": [
          "Bước 1 — Đọc đầu vào và mở thư mục: Đọc dir_path và ext từ stdin; gọi opendir(dir_path). Nếu trả về NULL (thư mục không tồn tại, không có quyền hoặc đường dẫn là tệp thường) thì in -1 và kết thúc.",
          "Bước 2 — Duyệt từng mục con bằng readdir(): Lặp while ((de = readdir(dir)) != NULL); bỏ qua ngay hai mục đặc biệt \".\" (thư mục hiện tại) và \"..\" (thư mục cha).",
          "Bước 3 — Ghép đường dẫn đầy đủ: Vì de->d_name chỉ chứa tên ngắn (ví dụ \"a.txt\") chứ không có tên thư mục, ta dùng snprintf() ghép thành \"dir_path/d_name\" để gọi stat() chính xác.",
          "Bước 4 — Lọc đúng tệp thường và so khớp hậu tố: Gọi stat(full_path, &st); kiểm tra đồng thời stat thành công (== 0) VÀ S_ISREG(st.st_mode) (loại bỏ thư mục con như \"sub.txt/\"). Sau đó kiểm tra name_len >= ext_len và so sánh chính xác phần đuôi bằng strcmp(de->d_name + name_len - ext_len, ext) == 0.",
          "Bước 5 — Cộng dồn và đóng thư mục: Tăng count++, cộng total_size += st.st_size; kết thúc vòng lặp thì gọi closedir(dir) và in \"count total_size\"."
        ],
        "whyThisWay": "Có hai cái bẫy kinh điển mà sinh viên rất hay mắc khi làm bài thư mục: (1) Truyền thẳng de->d_name vào stat() khiến stat() tìm nhầm trong thư mục hiện hành (CWD) thay vì bên trong dir_path và thất bại hàng loạt — do đó BẮT BUỘC ghép full_path bằng snprintf(). (2) Không kiểm tra S_ISREG(st.st_mode) dẫn đến đếm nhầm cả thư mục con có tên kết thúc bằng ext (ví dụ \"sub.txt/\"). Ngoài ra, kiểm tra hậu tố bằng dịch con trỏ (de->d_name + name_len - ext_len) kết hợp điều kiện name_len >= ext_len đảm bảo khớp chính xác phần đuôi, tránh dùng strstr() vốn sẽ nhận nhầm các tên như \"a.txt.bak\" hay đọc lùi ra ngoài vùng nhớ mảng!",
        "complexity": "Thời gian: O(M × L) với M là số mục trong thư mục và L là độ dài tên trung bình · Bộ nhớ: O(1) · Tài nguyên OS: 1 Directory Stream (1 FD nội bộ)"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–4",
          "title": "Khai báo thư viện duyệt thư mục (<dirent.h>), xử lý chuỗi và siêu dữ liệu",
          "code": "#include <stdio.h>\n#include <string.h>\n#include <dirent.h>\n#include <sys/stat.h>",
          "explain": "<stdio.h> cung cấp scanf, printf, snprintf. <string.h> cung cấp strlen và strcmp để xử lý tên tệp và hậu tố. <dirent.h> (Directory Entries) cung cấp kiểu DIR, cấu trúc struct dirent và bộ ba hàm opendir(), readdir(), closedir(). <sys/stat.h> cung cấp struct stat, hàm stat() và macro S_ISREG()."
        },
        {
          "lines": "Dòng 6–8",
          "title": "Đọc đường dẫn thư mục và chuỗi hậu tố ext cần lọc",
          "code": "int main() {\n    char dir_path[300], ext[64];\n    scanf(\"%s %s\", dir_path, ext);",
          "explain": "Khai báo dir_path[300] (dư so với giới hạn 256) và ext[64] (dư so với giới hạn 32), sau đó đọc cả hai chuỗi không chứa khoảng trắng từ stdin."
        },
        {
          "lines": "Dòng 10–14",
          "title": "Mở luồng thư mục bằng opendir() và xử lý lỗi",
          "code": "DIR *dir = opendir(dir_path);\nif (dir == NULL) {\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "opendir(dir_path) mở thư mục và trả về con trỏ DIR * đại diện cho luồng duyệt thư mục. Khác với open() trả về -1, opendir() trả về con trỏ NULL khi thất bại (thư mục không tồn tại, không có quyền đọc hoặc dir_path là tệp thường). Ta kiểm tra if (dir == NULL) để in -1 và thoát an toàn, tránh lỗi Segmentation Fault khi truyền NULL vào readdir()."
        },
        {
          "lines": "Dòng 16–23",
          "title": "Khởi tạo biến đếm, duyệt từng mục bằng readdir() và bỏ qua \".\" / \"..\"",
          "code": "int ext_len = strlen(ext);\nlong long count = 0, total_size = 0;\nstruct dirent *de;\nwhile ((de = readdir(dir)) != NULL) {\n    if (strcmp(de->d_name, \".\") == 0 || strcmp(de->d_name, \"..\") == 0) {\n        continue;\n    }",
          "explain": "Tính trước ext_len một lần ngoài vòng lặp để tối ưu. Khai báo count và total_size kiểu long long phòng tràn tổng kích thước nhiều tệp lớn. Mỗi lần gọi readdir(dir) trả về con trỏ struct dirent * chứa tên mục ở trường de->d_name; khi duyệt hết thư mục, readdir() trả về NULL và vòng lặp dừng. Mọi thư mục Linux đều chứa hai mục hệ thống \".\" (chính nó) và \"..\" (thư mục cha), nên ta bỏ qua ngay bằng continue."
        },
        {
          "lines": "Dòng 25–26",
          "title": "Ghép đường dẫn đầy đủ \"dir_path/d_name\" an toàn bằng snprintf()",
          "code": "    char full_path[600];\n    snprintf(full_path, sizeof(full_path), \"%s/%s\", dir_path, de->d_name);",
          "explain": "Vì de->d_name chỉ là tên mục con (như \"a.txt\"), ta ghép \"dir_path/d_name\" vào bộ đệm full_path[600] (lớn hơn tổng chiều dài tối đa của dir_path và tên tệp 255 byte trên Linux). Dùng snprintf() kèm kích thước sizeof(full_path) an toàn hơn sprintf() vì nó tự giới hạn độ dài, chống tràn bộ đệm. (Nếu dir_path có sẵn '/' ở cuối như \"dir06/\", Linux vẫn hiểu \"dir06//a.txt\" tương đương \"dir06/a.txt\".)"
        },
        {
          "lines": "Dòng 28–36",
          "title": "Lọc đúng tệp thường (S_ISREG) và so khớp hậu tố bằng phép dịch con trỏ chuỗi",
          "code": "    struct stat st;\n    if (stat(full_path, &st) == 0 && S_ISREG(st.st_mode)) {\n        int name_len = strlen(de->d_name);\n        if (name_len >= ext_len && strcmp(de->d_name + name_len - ext_len, ext) == 0) {\n            count++;\n            total_size += st.st_size;\n        }\n    }\n}",
          "explain": "Gọi stat(full_path, &st) lấy siêu dữ liệu. Phải kiểm tra stat(...) == 0 trước rồi mới kiểm tra S_ISREG(st.st_mode) nhờ cơ chế đánh giá đoản mạch (short-circuit) của toán tử &&: điều này vừa loại bỏ thư mục con (như sub.txt/) vừa tránh đọc rác nếu stat thất bại. Tiếp theo, phép kiểm tra name_len >= ext_len là bắt buộc trước khi cộng trừ con trỏ (de->d_name + name_len - ext_len): nếu tên tệp ngắn hơn ext (ví dụ \"a\" so với \".txt\") mà không kiểm tra, con trỏ sẽ trỏ lùi ra trước đầu mảng gây lỗi truy cập vùng nhớ (UB)! strcmp() so sánh phân biệt hoa thường chính xác phần đuôi chuỗi; nếu khớp thì tăng count và cộng st.st_size vào total_size."
        },
        {
          "lines": "Dòng 38–41",
          "title": "Đóng thư mục bằng closedir() và in số tệp cùng tổng kích thước",
          "code": "closedir(dir);\nprintf(\"%lld %lld\\n\", count, total_size);\nreturn 0;\n}",
          "explain": "closedir(dir) đóng luồng thư mục và giải phóng File Descriptor + bộ nhớ đệm bên trong của đối tượng DIR *. Cuối cùng in đúng hai số count và total_size cách nhau một dấu cách rồi kết thúc."
        }
      ],
      "testCases": [
        {
          "name": "Thư mục hỗn hợp có tệp khớp, tệp khác đuôi và thư mục con cùng đuôi",
          "caseDesc": "dir06 chứa: a.txt (10B), b.txt (25B), c.log (100B) và thư mục con sub.txt/, tìm ext = \".txt\".",
          "howHandled": "sub.txt/ bị loại vì S_ISREG(st.st_mode) trả về sai; c.log không khớp hậu tố; chỉ đếm a.txt và b.txt → in \"2 35\"."
        },
        {
          "name": "Tên tệp chứa hậu tố ở giữa, sai chữ hoa/thường, hoặc ngắn hơn ext",
          "caseDesc": "Thư mục có: \"note.txt.bak\", \"README.TXT\", \"a\" khi tìm ext = \".txt\".",
          "howHandled": "\"note.txt.bak\" có đuôi \".bak\" ≠ \".txt\"; \"README.TXT\" không khớp vì strcmp phân biệt hoa/thường; \"a\" bị chặn bởi name_len >= ext_len → tất cả đều không được đếm, in \"0 0\"."
        },
        {
          "name": "Thư mục rỗng (chỉ chứa '.' và '..')",
          "caseDesc": "Thư mục hợp lệ nhưng không có tệp con nào bên trong.",
          "howHandled": "'.' và '..' bị bỏ qua bằng continue; vòng lặp kết thúc với count = 0, total_size = 0 → in \"0 0\"."
        },
        {
          "name": "Thư mục không tồn tại hoặc đường dẫn là tệp thường",
          "caseDesc": "Truyền dir_path = \"no_such_dir\" hoặc đường dẫn trỏ tới một tệp .txt.",
          "howHandled": "opendir() trả về NULL → nhánh if (dir == NULL) kích hoạt ngay, in \"-1\" và thoát."
        }
      ],
      "examRecipe": [
        "Khai báo 4 thư viện: <stdio.h>, <string.h>, <dirent.h>, <sys/stat.h>.",
        "Đọc dir_path và ext; gọi DIR *dir = opendir(dir_path); nếu dir == NULL in -1 và return 0.",
        "Dùng while ((de = readdir(dir)) != NULL), bỏ qua \".\" và \"..\", rồi ghép full_path bằng snprintf(full_path, sizeof(full_path), \"%s/%s\", dir_path, de->d_name).",
        "Kiểm tra if (stat(full_path, &st) == 0 && S_ISREG(st.st_mode)) rồi kiểm tra hậu tố bằng if (name_len >= ext_len && strcmp(de->d_name + name_len - ext_len, ext) == 0).",
        "Cộng dồn count và total_size (long long), gọi closedir(dir) và in \"%lld %lld\\n\"."
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
      "origin": "Chương 2 — Memory-Mapped I/O (Ánh xạ tệp vào bộ nhớ ảo) với mmap() và munmap() (Mục 2.10 · Slide APT02).",
      "idea": {
        "summary": "Thay vì dùng vòng lặp read() / write() để sao chép dữ liệu qua lại giữa đĩa và bộ đệm RAM, Memory-Mapped I/O (mmap) ánh xạ trực tiếp toàn bộ tệp vào không gian địa chỉ ảo của tiến trình như một mảng byte thông thường. Nhờ cờ MAP_SHARED, mọi thay đổi trên mảng (data[i] ^= key) sẽ được nhân Linux tự động ghi xuống tệp thật trên đĩa tại chỗ.",
        "steps": [
          "Bước 1 — Mở tệp ở chế độ đọc-ghi đồng thời: Đọc path và key; gọi open(path, O_RDWR) vì ta vừa đọc byte cũ vừa ghi đè byte mới sau khi XOR. Nếu lỗi (fd < 0) thì in -1 và thoát.",
          "Bước 2 — Kiểm tra kích thước tệp bằng fstat(): Lấy st.st_size qua fstat(fd, &st). Nếu tệp rỗng (st.st_size == 0), KHÔNG gọi mmap() (vì POSIX quy định mmap độ dài 0 sẽ trả về lỗi EINVAL) mà đóng tệp và in 0 ngay.",
          "Bước 3 — Ánh xạ tệp vào bộ nhớ bằng mmap(): Gọi mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0); kiểm tra kết quả bằng hằng MAP_FAILED (KHÔNG phải NULL!).",
          "Bước 4 — Biến đổi XOR tại chỗ và tính tổng modulo: Duyệt i từ 0 đến st.st_size - 1, cập nhật data[i] = data[i] ^ (unsigned char)key và cộng dồn sum = (sum + data[i]) % 1000000007LL.",
          "Bước 5 — Hủy ánh xạ và dọn dẹp: Gọi munmap(data, st.st_size) để đồng bộ/gỡ ánh xạ vùng nhớ, đóng fd bằng close(fd), rồi in giá trị sum."
        ],
        "whyThisWay": "mmap() loại bỏ bước trung gian copy dữ liệu giữa page cache của nhân Linux và buffer ở không gian người dùng (zero-copy), cực kỳ nhanh với tệp lớn tới 10 MB và cho phép truy cập tệp tự nhiên như mảng data[i]. Có ba bẫy sống còn cần tránh: (1) Nếu mở tệp chỉ với O_RDONLY mà xin PROT_WRITE | MAP_SHARED thì mmap() thất bại với lỗi EACCES; (2) Nếu dùng MAP_PRIVATE thay vì MAP_SHARED, mọi thay đổi XOR chỉ nằm trong RAM riêng của tiến trình và KHÔNG được ghi lại xuống tệp trên đĩa; (3) Nếu gọi mmap() với length = 0 (tệp rỗng), Linux trả về MAP_FAILED (lỗi EINVAL) nên bắt buộc phải tách nhánh st.st_size == 0 trước.",
        "complexity": "Thời gian: O(N) với N là kích thước tệp (truy cập trực tiếp qua page cache) · Bộ nhớ: O(1) bộ nhớ vật lý cố định (nhân tự nạp trang theo nhu cầu — demand paging) · Tài nguyên OS: 1 FD + 1 vùng VMA ánh xạ"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–5",
          "title": "Khai báo thư viện I/O, stat và ánh xạ bộ nhớ (<sys/mman.h>)",
          "code": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\n#include <sys/mman.h>",
          "explain": "<fcntl.h> cung cấp open() và O_RDWR; <unistd.h> cung cấp close() và off_t; <sys/stat.h> cung cấp fstat() và struct stat; đặc biệt <sys/mman.h> (Memory Management) cung cấp hàm mmap(), munmap() cùng các hằng PROT_READ, PROT_WRITE, MAP_SHARED và MAP_FAILED."
        },
        {
          "lines": "Dòng 7–16",
          "title": "Đọc tham số và mở tệp ở chế độ đọc-ghi đồng thời (O_RDWR)",
          "code": "int main() {\n    char path[256];\n    int key;\n    scanf(\"%s %d\", path, &key);\n    int fd = open(path, O_RDWR);\n    if (fd < 0) { printf(\"-1\\n\"); return 0; }",
          "explain": "Đọc đường dẫn tệp và khóa key (0..255). Mở tệp bằng cờ O_RDWR (Read & Write) là điều kiện tiên quyết để được phép ánh xạ ghi với PROT_READ | PROT_WRITE và MAP_SHARED. Lưu ý: KHÔNG dùng O_WRONLY (vì mmap cần quyền đọc để nạp trang tệp vào RAM) và KHÔNG dùng O_CREAT/O_TRUNC (vì đề bài yêu cầu sửa tệp có sẵn, nếu tệp không tồn tại phải báo -1)."
        },
        {
          "lines": "Dòng 18–23",
          "title": "Lấy kích thước tệp từ File Descriptor bằng fstat()",
          "code": "struct stat st;\nif (fstat(fd, &st) < 0) {\n    close(fd);\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Ta cần biết chính xác kích thước tệp st.st_size để truyền làm độ dài ánh xạ cho mmap() và làm cận vòng lặp. Nếu fstat() lỗi (< 0), nhớ đóng fd trước khi in -1 và thoát."
        },
        {
          "lines": "Dòng 25–29",
          "title": "Xử lý trường hợp đặc biệt tệp rỗng 0 byte để tránh lỗi EINVAL của mmap()",
          "code": "if (st.st_size == 0) {\n    close(fd);\n    printf(\"0\\n\");\n    return 0;\n}",
          "explain": "Theo chuẩn POSIX và nhân Linux, gọi mmap() với tham số độ dài length == 0 luôn thất bại và trả về MAP_FAILED (mã lỗi EINVAL). Do đó, với tệp rỗng 0 byte, ta phải chặn trước ở đây: đóng fd, in 0 (tổng của 0 byte là 0) và kết thúc sạch."
        },
        {
          "lines": "Dòng 31–36",
          "title": "Ánh xạ tệp vào không gian địa chỉ ảo với PROT_READ | PROT_WRITE và MAP_SHARED",
          "code": "unsigned char *data = mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);\nif (data == MAP_FAILED) {\n    close(fd);\n    printf(\"-1\\n\");\n    return 0;\n}",
          "explain": "Giải mã đủ 6 tham số của mmap(): (1) NULL — để nhân Linux tự chọn địa chỉ ảo phù hợp; (2) st.st_size — số byte ánh xạ; (3) PROT_READ | PROT_WRITE — cho phép cả đọc lẫn ghi trên vùng nhớ ánh xạ; (4) MAP_SHARED — mọi thay đổi ghi vào data[] được chia sẻ và phản ánh trực tiếp xuống tệp thật trên đĩa; (5) fd — File Descriptor của tệp; (6) 0 — bắt đầu ánh xạ từ đầu tệp (offset phải là bội của kích thước trang nhớ). Ép sang con trỏ unsigned char * để mỗi phần tử data[i] nằm trong [0..255]. CỰC KỲ LƯU Ý: lỗi của mmap() được kiểm tra bằng data == MAP_FAILED (thường là (void*)-1), TUYỆT ĐỐI KHÔNG kiểm tra data == NULL!"
        },
        {
          "lines": "Dòng 38–43",
          "title": "Biến đổi XOR trực tiếp từng byte trên mảng ánh xạ và cộng dồn modulo 10^9 + 7",
          "code": "long long sum = 0;\nlong long mod = 1000000007LL;\nfor (off_t i = 0; i < st.st_size; i++) {\n    data[i] = data[i] ^ (unsigned char)key;\n    sum = (sum + data[i]) % mod;\n}",
          "explain": "Duyệt qua toàn bộ tệp bằng chỉ số i kiểu off_t (tránh tràn nếu tệp rất lớn). Phép toán data[i] = data[i] ^ (unsigned char)key thực hiện XOR từng bit ngay tại chỗ trên trang nhớ ánh xạ; nhờ MAP_SHARED, nội dung tệp trên đĩa sẽ được cập nhật theo đúng dữ liệu mới này. Vì data là con trỏ unsigned char *, data[i] luôn mang giá trị không âm từ 0 đến 255 — nếu dùng nhầm char có dấu, các byte >= 128 sẽ bị hiểu thành số âm làm sai hoàn toàn tổng sum! Cộng dồn và lấy dư ngay trong vòng lặp bằng mod = 1000000007LL để tổng không bao giờ vượt quá giới hạn."
        },
        {
          "lines": "Dòng 45–49",
          "title": "Hủy ánh xạ bằng munmap(), đóng tệp và in tổng kiểm tra",
          "code": "munmap(data, st.st_size);\nclose(fd);\nprintf(\"%lld\\n\", sum);\nreturn 0;\n}",
          "explain": "munmap(data, st.st_size) gỡ bỏ vùng ánh xạ khỏi không gian địa chỉ ảo của tiến trình (độ dài phải khớp đúng st.st_size đã truyền vào mmap), sau đó close(fd) đóng File Descriptor và in tổng sum. Nhân Linux sẽ tự ghi các trang nhớ bẩn (dirty pages) xuống tệp đĩa an toàn."
        }
      ],
      "testCases": [
        {
          "name": "Biến đổi XOR tiêu chuẩn trên tệp nhị phân",
          "caseDesc": "Tệp xor07.bin có 3 byte [0x41, 0x00, 0xFF], khóa key = 15 (0x0F).",
          "howHandled": "data[0] = 0x41 ^ 0x0F = 0x4E (78); data[1] = 0x00 ^ 0x0F = 0x0F (15); data[2] = 0xFF ^ 0x0F = 0xF0 (240). Tệp trên đĩa đổi thành [0x4E, 0x0F, 0xF0], tổng 78 + 15 + 240 = 333 → in 333."
        },
        {
          "name": "Tệp rỗng 0 byte (bẫy EINVAL của mmap)",
          "caseDesc": "Tệp tồn tại nhưng kích thước bằng 0 byte, key = 123.",
          "howHandled": "Nhánh if (st.st_size == 0) chặn lại trước khi gọi mmap(), đóng fd và in 0 chính xác thay vì in -1 do lỗi EINVAL."
        },
        {
          "name": "Tệp lớn (tới 10 MB) và khóa key = 0 hoặc key = 255",
          "caseDesc": "Tệp 10^7 byte toàn giá trị 0xFF, key = 0 → tổng thô 2.55 × 10^9 vượt quá 10^9 + 7 và tràn int 32-bit.",
          "howHandled": "Sử dụng unsigned char nên 0xFF mang giá trị dương 255 (không bị thành -1); cộng dồn kiểu long long và lấy dư % 1000000007LL sau mỗi byte đảm bảo không bao giờ tràn số."
        },
        {
          "name": "Tệp không tồn tại hoặc không có quyền ghi",
          "caseDesc": "Truyền đường dẫn sai hoặc tệp chỉ có quyền đọc (0444).",
          "howHandled": "open(path, O_RDWR) trả về -1 → in -1 và thoát ngay, không gọi fstat hay mmap."
        }
      ],
      "examRecipe": [
        "Khai báo đủ 5 header: <stdio.h>, <fcntl.h>, <unistd.h>, <sys/stat.h>, <sys/mman.h>.",
        "Mở tệp bằng O_RDWR (kiểm tra fd < 0 → in -1); gọi fstat(fd, &st) để lấy kích thước.",
        "BẮT BUỘC chặn tệp rỗng trước mmap: if (st.st_size == 0) { close(fd); printf(\"0\\n\"); return 0; }.",
        "Ánh xạ bằng unsigned char *data = mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0); kiểm tra lỗi bằng data == MAP_FAILED.",
        "Duyệt for (off_t i = 0; i < st.st_size; i++) thực hiện data[i] ^= (unsigned char)key và sum = (sum + data[i]) % 1000000007LL; cuối cùng gọi munmap(), close(fd) và in sum."
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
      "origin": "Chương 2 — Truy cập ngẫu nhiên (Random Access) bản ghi nhị phân cố định kích thước bằng lseek() (Mục 2.6 · Dạng bài kinh điển sát đề thi cũ cập nhật cấu trúc 8B/48B/64B).",
      "idea": {
        "summary": "Tệp nhị phân lưu liên tiếp N bản ghi có kích thước cố định 8 byte (struct Record gồm hai số int32_t: id và score), giống như một mảng cấu trúc đặt trên đĩa. Nhờ kích thước mỗi bản ghi bằng nhau, bản ghi thứ idx luôn nằm tại đúng địa chỉ byte pos = idx × sizeof(struct Record), cho phép ta dùng lseek() nhảy trực tiếp tới sửa tại chỗ mà không cần đọc hay viết lại cả tệp.",
        "steps": [
          "Bước 1 — Định nghĩa bản ghi cố định kích thước: Dùng struct Record { int32_t id; int32_t score; }; từ <stdint.h> để đảm bảo kích thước luôn chính xác 8 byte trên mọi kiến trúc CPU.",
          "Bước 2 — Mở tệp đọc-ghi và kiểm tra tính toàn vẹn: Mở tệp bằng open(path, O_RDWR); gọi fstat(fd, &st) để kiểm tra kích thước tệp phải chia hết cho sizeof(struct Record) (8 byte), rồi tính tổng số bản ghi N = st.st_size / sizeof(struct Record).",
          "Bước 3 — Xử lý q truy vấn cập nhật tại chỗ: Với mỗi cặp (idx, delta), nếu idx < 0 hoặc idx >= N thì bỏ qua (continue). Ngược lại, tính pos = idx * (off_t)sizeof(struct Record), gọi lseek(fd, pos, SEEK_SET) → read() đọc 8 byte vào rec → cộng rec.score += delta → gọi lseek(fd, pos, SEEK_SET) LẦN THỨ HAI để lùi con trỏ về đúng vị trí bản ghi vừa đọc → write() ghi đè 8 byte lại đĩa.",
          "Bước 4 — Đọc lại toàn bộ tệp để tính tổng score: Gọi lseek(fd, 0, SEEK_SET) đưa con trỏ về đầu tệp, đọc lần lượt N bản ghi và cộng dồn rec.score vào biến 64-bit total (kiểu long long).",
          "Bước 5 — Đóng tệp và xuất kết quả: Gọi close(fd) và in total theo định dạng %lld."
        ],
        "whyThisWay": "Bẫy trí mạng số 1 của bài này nằm ở bước ghi đè: sau khi gọi read(fd, &rec, 8), nhân Linux TỰ ĐỘNG đẩy con trỏ tệp tiến thêm 8 byte sang đầu bản ghi kế tiếp (idx + 1). Nếu quên không gọi lseek(fd, pos, SEEK_SET) lần thứ hai trước khi gọi write(), ta sẽ ghi đè bản ghi idx sang bản ghi idx + 1 làm hỏng toàn bộ dữ liệu tệp! Ngoài ra, dùng <stdint.h> với int32_t đảm bảo mỗi trường đúng 4 byte (không có padding), và ép kiểu (off_t) khi nhân idx * sizeof(struct Record) tránh tràn số nguyên khi idx lớn.",
        "complexity": "Thời gian: O(q + N) (mỗi truy vấn nhảy O(1) trực tiếp tới bản ghi, sau đó quét 1 lượt N bản ghi) · Bộ nhớ: O(1) (chỉ giữ 1 struct Record 8 byte trong RAM) · Tài nguyên OS: 1 File Descriptor"
      },
      "lineByLine": [
        {
          "lines": "Dòng 1–10",
          "title": "Khai báo thư viện, kiểu số nguyên cố định kích thước (<stdint.h>) và struct Record 8 byte",
          "code": "#include <stdio.h>\n#include <stdint.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <sys/stat.h>\nstruct Record { int32_t id; int32_t score; };",
          "explain": "<stdint.h> cung cấp kiểu int32_t (số nguyên có dấu cố định đúng 32 bit = 4 byte). Khai báo struct Record gồm hai trường int32_t liên tiếp đảm bảo kích thước sizeof(struct Record) luôn đúng bằng 8 byte và không phát sinh byte đệm (struct padding), khớp 100% với định dạng nhị phân của tệp đầu vào. Các thư viện <fcntl.h>, <unistd.h>, <sys/stat.h> phục vụ open, lseek, read, write, close và fstat."
        },
        {
          "lines": "Dòng 12–21",
          "title": "Đọc đường dẫn tệp, số truy vấn q và mở tệp ở chế độ đọc-ghi (O_RDWR)",
          "code": "int main() {\n    char path[256];\n    int q;\n    scanf(\"%s %d\", path, &q);\n    int fd = open(path, O_RDWR);\n    if (fd < 0) { printf(\"-1\\n\"); return 0; }",
          "explain": "Đọc đường dẫn tệp nhị phân và số lượng lệnh cập nhật q. Mở tệp bằng O_RDWR vì ta cần vừa đọc cấu trúc cũ vừa ghi đè cấu trúc mới trực tiếp vào tệp. Nếu tệp không tồn tại hoặc không có quyền đọc/ghi (fd < 0), in -1 và kết thúc ngay."
        },
        {
          "lines": "Dòng 23–30",
          "title": "Kiểm tra tính hợp lệ kích thước tệp (bội của 8 byte) bằng fstat() và tính số bản ghi N",
          "code": "struct stat st;\nif (fstat(fd, &st) < 0 || st.st_size % sizeof(struct Record) != 0) {\n    close(fd);\n    printf(\"-1\\n\");\n    return 0;\n}\nlong long N = st.st_size / sizeof(struct Record);",
          "explain": "Gọi fstat(fd, &st) lấy kích thước tệp theo byte. Một tệp bản ghi hợp lệ phải có kích thước chia hết cho 8 (sizeof(struct Record)). Nếu fstat lỗi hoặc có byte lẻ thừa (st.st_size % 8 != 0), ta phải đóng fd, in -1 và thoát. Ngược lại, số lượng bản ghi trong tệp là N = st.st_size / 8."
        },
        {
          "lines": "Dòng 32–37",
          "title": "Đọc từng thao tác (idx, delta) và lọc bỏ chỉ số ngoài phạm vi [0, N-1]",
          "code": "for (int i = 0; i < q; i++) {\n    long long idx;\n    int32_t delta;\n    scanf(\"%lld %d\", &idx, &delta);\n    if (idx < 0 || idx >= N) continue;",
          "explain": "Đọc từng lệnh gồm chỉ số bản ghi idx (kiểu long long để nhận an toàn cả các giá trị biên âm hoặc rất lớn) và lượng thay đổi delta (kiểu int32_t). Nếu idx < 0 hoặc idx >= N, đề bài yêu cầu bỏ qua lệnh này mà không báo lỗi — lệnh continue giúp bỏ qua an toàn, tránh việc lseek/write ghi vượt quá cuối tệp tạo ra tệp lỗ hổng (sparse file) làm sai N."
        },
        {
          "lines": "Dòng 39–47",
          "title": "Chu trình Truy cập ngẫu nhiên: lseek → read → cộng delta → lseek lại → write đè tại chỗ",
          "code": "    off_t pos = idx * (off_t)sizeof(struct Record);\n    struct Record rec;\n    lseek(fd, pos, SEEK_SET);\n    read(fd, &rec, sizeof(rec));\n    rec.score += delta;\n    lseek(fd, pos, SEEK_SET);\n    write(fd, &rec, sizeof(rec));\n}",
          "explain": "Tính độ dời byte chính xác của bản ghi thứ idx: pos = idx * 8 (ép kiểu off_t tránh tràn). Bước 1: lseek(fd, pos, SEEK_SET) đưa con trỏ về đầu bản ghi idx. Bước 2: read(fd, &rec, sizeof(rec)) chép 8 byte nhị phân trực tiếp vào struct rec; SAU LỆNH NÀY CON TRỎ ĐÃ DỊCH SANG pos + 8! Bước 3: cập nhật rec.score += delta (giữ nguyên rec.id). Bước 4 (QUAN TRỌNG NHẤT): gọi lại lseek(fd, pos, SEEK_SET) để kéo con trỏ lùi về đúng vị trí pos (cũng có thể dùng lseek(fd, -(off_t)sizeof(rec), SEEK_CUR)). Bước 5: write(fd, &rec, sizeof(rec)) ghi đè đúng 8 byte tại chỗ."
        },
        {
          "lines": "Dòng 49–55",
          "title": "Đưa con trỏ về đầu tệp (offset 0) và đọc tuần tự toàn bộ N bản ghi để tính tổng score",
          "code": "lseek(fd, 0, SEEK_SET);\nlong long total = 0;\nstruct Record rec;\nfor (long long i = 0; i < N; i++) {\n    read(fd, &rec, sizeof(rec));\n    total += rec.score;\n}",
          "explain": "Sau khi chạy xong q truy vấn, con trỏ tệp đang nằm ở vị trí bất kỳ (hoặc đầu tệp nếu q = 0). Ta bắt buộc gọi lseek(fd, 0, SEEK_SET) để tua lại về byte 0. Sau đó đọc tuần tự từng bản ghi 8 byte (mỗi lần read tự động tiến 8 byte sang bản ghi kế tiếp) và cộng dồn rec.score vào biến 64-bit total (kiểu long long để tránh tràn int 32-bit vì N tới 10^5 và mỗi score có thể lên tới hàng tỷ sau nhiều lần cộng)."
        },
        {
          "lines": "Dòng 57–60",
          "title": "Đóng File Descriptor, in tổng score (kiểu long long) và thoát",
          "code": "close(fd);\nprintf(\"%lld\\n\", total);\nreturn 0;\n}",
          "explain": "Đóng tệp trả tài nguyên về cho nhân Linux và in ra tổng cuối cùng total theo đặc tả %lld."
        }
      ],
      "testCases": [
        {
          "name": "Cập nhật hợp lệ kết hợp chỉ số ngoài phạm vi và delta âm",
          "caseDesc": "3 bản ghi (101,10), (102,20), (103,30); q = 3 lệnh: (1, +5), (0, -3), (5, +100).",
          "howHandled": "Bản ghi 1 thành 25; bản ghi 0 thành 7; lệnh idx = 5 >= 3 bị continue bỏ qua. Đọc lại từ offset 0 được tổng 7 + 25 + 30 = 62."
        },
        {
          "name": "Nhiều lệnh cập nhật liên tiếp lên cùng một bản ghi (hoặc q = 0)",
          "caseDesc": "Cập nhật idx = 0 ba lần liên tiếp với +10, -4, +6 (hoặc không có lệnh nào q = 0).",
          "howHandled": "Mỗi lệnh đều lseek về đúng pos = 0, đọc giá trị mới nhất, cộng delta, lseek lại 0 và ghi đè nên thay đổi được tích lũy chính xác (không ghi nhầm sang idx = 1). Nếu q = 0, vòng lặp bỏ qua và chỉ đọc tính tổng gốc."
        },
        {
          "name": "Tổng score vượt giới hạn int 32-bit hoặc có tổng âm",
          "caseDesc": "N = 10^5 bản ghi, mỗi bản ghi có score = 10^5 (hoặc -10^5) → tổng = ±10^10.",
          "howHandled": "Biến total khai báo kiểu long long (64-bit có dấu) chứa thoải mái ±10^10 mà không bị tràn số (overflow)."
        },
        {
          "name": "Tệp không tồn tại hoặc kích thước không chia hết cho 8",
          "caseDesc": "Đường dẫn sai hoặc tệp nhị phân bị hỏng chỉ có 15 byte (15 % 8 != 0).",
          "howHandled": "open() < 0 hoặc fstat() cho st.st_size % sizeof(struct Record) != 0 → đóng tệp (nếu đã mở), in -1 và thoát ngay."
        }
      ],
      "examRecipe": [
        "Khai báo <stdio.h>, <stdint.h>, <fcntl.h>, <unistd.h>, <sys/stat.h> và định nghĩa struct Record { int32_t id; int32_t score; };.",
        "Mở tệp bằng O_RDWR; dùng fstat(fd, &st) kiểm tra lỗi và kiểm tra st.st_size % sizeof(struct Record) != 0 → nếu sai thì close(fd), in -1 và thoát; tính N = st.st_size / sizeof(struct Record).",
        "Với mỗi lệnh (idx, delta): bỏ qua nếu idx < 0 || idx >= N; ngược lại tính pos = idx * (off_t)sizeof(struct Record).",
        "Thực hiện đủ 5 bước vàng: lseek(fd, pos, SEEK_SET) → read() → rec.score += delta → lseek(fd, pos, SEEK_SET) LẦN 2 → write().",
        "Gọi lseek(fd, 0, SEEK_SET) tua về đầu tệp, đọc lần lượt N bản ghi cộng dồn vào long long total, đóng fd và in \"%lld\\n\"."
      ]
    }
  }
];
