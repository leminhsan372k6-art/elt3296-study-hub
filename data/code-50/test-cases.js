// Rigorous Exam-Grade Linux GCC Executable Test Suite for CR-01 .. CR-40
// 6 tight test cases per problem (1 Sample + 5 Deep Hidden Tests = 240 total executable tests!)
// Every hidden test targets a classic Moodle CodeRunner / SEB final-exam trap:
//   - File I/O: 0-byte, binary \0 & 0x80..0xFF signed-char traps, >4KB multi-buffer loops, O_TRUNC, %03o, suffix vs strstr, mmap page boundary
//   - Process/Pipe/Signal: 8-bit exit wrap %200, int overflow, fan-out fork bomb, EOF pipe close, signal coalescing, SIGKILL status macros
//   - Thread/Sync: high-contention mutex race, all-negative max, k > n, B=1 circular queue, negative even %, AB-BA & self-transfer deadlock
//   - Parallel/Cache: T > n, non-divisible chunks & tiles, long long overflow, strict tie-breaking, early-stop last index, reverse/dup qsort
//   - Dynamic Programming: greedy counterexamples, 0/1 vs Unbounded Knapsack, 10^9+7 grid mod, INF overflow, EMPTY LCS, strict > traceback

function recBytes(pairs) {
  const out = [];
  for (const [id, score] of pairs) {
    for (const v of [id, score]) {
      const u = v >>> 0;
      out.push(u & 0xff, (u >>> 8) & 0xff, (u >>> 16) & 0xff, (u >>> 24) & 0xff);
    }
  }
  return out;
}

export const REAL_TEST_CASES = {
  // ======================== PART 1: FILE I/O (CR-01 .. CR-08) ========================
  'CR-01': [
    { name: 'Test mẫu (20 byte văn bản)', hidden: false, setup: { files: [{ path: 'f01.txt', text: 'APT 2025\nLine 2: 99\n' }] }, stdin: 'f01.txt\n', expected: '20 2 7' },
    { name: 'Test ẩn 1: Tệp rỗng 0 byte', hidden: true, setup: { files: [{ path: 'empty01.txt', text: '' }] }, stdin: 'empty01.txt\n', expected: '0 0 0', hint: 'Với tệp 0 byte, read() trả 0 ngay lần đầu → phải in 0 0 0.' },
    { name: 'Test ẩn 2: Nhị phân có \\0, byte 0xFF & ký tự biên "/" ":"', hidden: true, setup: { files: [{ path: 'bin01.dat', bytes: [65, 0, 47, 48, 57, 58, 10, 255, 128, 0] }] }, stdin: 'bin01.dat\n', expected: '10 1 2', hint: 'Cấm strlen() vì có byte \\0; "/" (47) và ":" (58) nằm ngay sát "0".."9"; dùng unsigned char để an toàn với byte >= 128.' },
    { name: 'Test ẩn 3: Tệp lớn 9000 byte (vượt 2 lần buffer 4KB)', hidden: true, setup: { files: [{ path: 'big01.txt', repeatText: 'A1\n', repeatCount: 3000 }] }, stdin: 'big01.txt\n', expected: '9000 3000 3000', hint: 'Bắt buộc đọc trong vòng while ((n = read(...)) > 0) để đọc hết tệp lớn hơn 1 buffer.' },
    { name: 'Test ẩn 4: Không có \\n và không có chữ số', hidden: true, setup: { files: [{ path: 'nodig.txt', text: 'Hello Linux' }] }, stdin: 'nodig.txt\n', expected: '11 0 0', hint: 'Không đếm nhầm dòng cuối nếu không có ký tự \\n.' },
    { name: 'Test ẩn 5: Tệp không tồn tại (-1)', hidden: true, stdin: 'khong_co_01.txt\n', expected: '-1', hint: 'Khi open() trả < 0 cần in đúng -1 rồi thoát.' },
  ],

  'CR-02': [
    { name: 'Test mẫu (nối vào dst có sẵn)', hidden: false, setup: { files: [{ path: 'src02.txt', text: '_LINUX' }, { path: 'dst02.txt', text: 'HELLO' }] }, stdin: 'src02.txt dst02.txt\n', expected: '11', checkFile: { path: 'dst02.txt', text: 'HELLO_LINUX' } },
    { name: 'Test ẩn 1: Đích chưa tồn tại (O_CREAT) + byte \\0', hidden: true, setup: { files: [{ path: 's2.bin', bytes: [65, 0, 66, 67, 255] }] }, stdin: 's2.bin new_dst02.bin\n', expected: '5', checkFile: { path: 'new_dst02.bin', bytes: [65, 0, 66, 67, 255] }, hint: 'Phải có cờ O_CREAT và quyền 0644, ghi theo đúng n byte đọc được.' },
    { name: 'Test ẩn 2: Tệp nguồn rỗng 0 byte (giữ nguyên đích)', hidden: true, setup: { files: [{ path: 'e2.txt', text: '' }, { path: 'd2.txt', text: 'KEEP!' }] }, stdin: 'e2.txt d2.txt\n', expected: '5', checkFile: { path: 'd2.txt', text: 'KEEP!' }, hint: 'Nguồn 0 byte không ghi thêm gì, tổng kích thước đích vẫn là 5.' },
    { name: 'Test ẩn 3: Nối tệp lớn 8500 byte vượt nhiều buffer', hidden: true, setup: { files: [{ path: 'big2.txt', repeatText: '0123456789', repeatCount: 850 }, { path: 'd2b.txt', text: '0123456789' }] }, stdin: 'big2.txt d2b.txt\n', expected: '8510', checkFile: { path: 'd2b.txt', repeatText: '0123456789', repeatCount: 851 }, hint: 'Đọc/ghi trong vòng lặp tới khi EOF và xử lý short write.' },
    { name: 'Test ẩn 4: Nguồn không tồn tại (không được sửa đích)', hidden: true, setup: { files: [{ path: 'keep02.txt', text: 'SAFE' }] }, stdin: 'missing02.txt keep02.txt\n', expected: '-1', checkFile: { path: 'keep02.txt', text: 'SAFE' }, hint: 'Mở tệp nguồn TRƯỚC tệp đích; lỗi nguồn thì in -1 ngay.' },
    { name: 'Test ẩn 5: Cả nguồn và đích đều rỗng 0 byte', hidden: true, setup: { files: [{ path: 'z1.bin', text: '' }, { path: 'z2.bin', text: '' }] }, stdin: 'z1.bin z2.bin\n', expected: '0', checkFile: { path: 'z2.bin', text: '' }, hint: 'Lấy kích thước cuối bằng lseek(dst, 0, SEEK_END) hoặc fstat().' },
  ],

  'CR-03': [
    { name: 'Test mẫu (tệp thường 128 byte, quyền 0644)', hidden: false, setup: { files: [{ path: 'meta03.bin', bytes: Array(128).fill(65), mode: 0o644 }] }, stdin: 'meta03.bin\n', expected: 'REG 128 644' },
    { name: 'Test ẩn 1: Quyền thực thi 0750', hidden: true, setup: { files: [{ path: 'm3_a.sh', text: 'Hello', mode: 0o750 }] }, stdin: 'm3_a.sh\n', expected: 'REG 5 750', hint: 'Lọc 9 bit quyền bằng (st.st_mode & 0777).' },
    { name: 'Test ẩn 2: Tệp 0 byte quyền 0600', hidden: true, setup: { files: [{ path: 'm3_z.txt', text: '', mode: 0o600 }] }, stdin: 'm3_z.txt\n', expected: 'REG 0 600', hint: 'Tệp rỗng vẫn là REG với size 0.' },
    { name: 'Test ẩn 3: Quyền có số 0 ở đầu (0077 → bắt buộc in 077)', hidden: true, setup: { files: [{ path: 'm3_lead.txt', text: 'X', mode: 0o077 }] }, stdin: 'm3_lead.txt\n', expected: 'REG 1 077', hint: 'Phải dùng định dạng %03o (không dùng %o vì sẽ mất số 0 đầu thành 77!).' },
    { name: 'Test ẩn 4: Tệp lớn 10000 byte quyền 0755', hidden: true, setup: { files: [{ path: 'm3_big.bin', repeatText: '1234567890', repeatCount: 1000, mode: 0o755 }] }, stdin: 'm3_big.bin\n', expected: 'REG 10000 755', hint: 'In st.st_size bằng kiểu (long long) với %lld.' },
    { name: 'Test ẩn 5: Đường dẫn là THƯ MỤC (S_ISDIR → DIR)', hidden: true, setup: { dirs: ['sub_dir03'] }, stdin: 'sub_dir03\n', expected: 'DIR <size> 755', expectedRegex: '^DIR \\d+ 755$', hint: 'Bắt buộc phân nhánh S_ISDIR(st.st_mode) để in DIR thay vì luôn in REG!' },
    { name: 'Test ẩn 6: Đường dẫn không tồn tại (-1)', hidden: true, stdin: 'nope03.bin\n', expected: '-1', hint: 'Nếu stat() == -1 thì chỉ in -1.' },
  ],

  'CR-04': [
    { name: 'Test mẫu (offset=6, max=5)', hidden: false, setup: { files: [{ path: 't1_src.txt', text: 'Hello Linux File IO!' }] }, stdin: 't1_src.txt t1_dst.txt 6 5\n', expected: '5', checkFile: { path: 't1_dst.txt', text: 'Linux' } },
    { name: 'Test ẩn 1: offset >= kích thước tệp (tạo đích rỗng)', hidden: true, setup: { files: [{ path: 's4.txt', text: 'ABC' }] }, stdin: 's4.txt d4.txt 10 5\n', expected: '0', checkFile: { path: 'd4.txt', text: '' }, hint: 'offset >= size vẫn tạo/ghi đè tệp đích 0 byte và in 0.' },
    { name: 'Test ẩn 2: max_bytes == 0 (phải O_TRUNC xóa nội dung cũ của đích)', hidden: true, setup: { files: [{ path: 's4m.txt', text: 'DATA' }, { path: 'd4m.txt', text: 'OLD_GARBAGE' }] }, stdin: 's4m.txt d4m.txt 1 0\n', expected: '0', checkFile: { path: 'd4m.txt', text: '' }, hint: 'Phải mở đích với O_TRUNC để xóa nội dung cũ khi max_bytes == 0.' },
    { name: 'Test ẩn 3: offset + max > size (đọc đuôi tệp nhị phân có \\0)', hidden: true, setup: { files: [{ path: 's4b.bin', bytes: [10, 20, 0, 30, 40, 0] }] }, stdin: 's4b.bin d4b.bin 2 100\n', expected: '4', checkFile: { path: 'd4b.bin', bytes: [0, 30, 40, 0] }, hint: 'Dừng khi read() gặp EOF, không được đọc/ghi thừa rác.' },
    { name: 'Test ẩn 4: Trích đoạn lớn 5000 byte vượt buffer 4KB', hidden: true, setup: { files: [{ path: 's4big.txt', repeatText: 'ABCD', repeatCount: 2500 }] }, stdin: 's4big.txt d4big.txt 400 5000\n', expected: '5000', checkFile: { path: 'd4big.txt', repeatText: 'ABCD', repeatCount: 1250 }, hint: 'Giới hạn số byte đọc mỗi lượt bằng min(sizeof(buf), remaining).' },
    { name: 'Test ẩn 5: offset âm (-3) → in -1', hidden: true, setup: { files: [{ path: 's4n.txt', text: 'ABC' }] }, stdin: 's4n.txt d4n.txt -3 2\n', expected: '-1', hint: 'Kiểm tra if (offset < 0) in -1 trước khi mở đích.' },
    { name: 'Test ẩn 6: Tệp nguồn không tồn tại (-1)', hidden: true, stdin: 'missing4.txt d4x.txt 0 5\n', expected: '-1', hint: 'Nếu open(src, O_RDONLY) < 0 → in -1 ngay.' },
  ],

  'CR-05': [
    { name: 'Test mẫu (buf_size=4 không chia hết)', hidden: false, setup: { files: [{ path: 'rev_in.bin', text: 'ABCDE\n' }] }, stdin: 'rev_in.bin rev_out.bin 4\n', expected: '6', checkFile: { path: 'rev_out.bin', text: '\nEDCBA' } },
    { name: 'Test ẩn 1: Tệp nhị phân có byte \\0 & 0xFF (buf_size=2)', hidden: true, setup: { files: [{ path: 'r5.bin', bytes: [1, 0, 255, 0, 3] }] }, stdin: 'r5.bin r5_out.bin 2\n', expected: '5', checkFile: { path: 'r5_out.bin', bytes: [3, 0, 255, 0, 1] }, hint: 'Đảo trên mảng unsigned char theo đúng kích thước khối.' },
    { name: 'Test ẩn 2: Tệp rỗng 0 byte', hidden: true, setup: { files: [{ path: 'r5e.bin', text: '' }] }, stdin: 'r5e.bin r5e_out.bin 8\n', expected: '0', checkFile: { path: 'r5e_out.bin', text: '' }, hint: 'Tệp rỗng vẫn tạo tệp đích 0 byte và in 0.' },
    { name: 'Test ẩn 3: buf_size = 1 (đảo từng byte bằng lseek)', hidden: true, setup: { files: [{ path: 'r5_1.txt', text: '12345' }] }, stdin: 'r5_1.txt r5_1o.txt 1\n', expected: '5', checkFile: { path: 'r5_1o.txt', text: '54321' }, hint: 'Đảm bảo vòng lặp lùi pos về đúng 0 khi buf_size = 1.' },
    { name: 'Test ẩn 4: buf_size > kích thước tệp + tệp lớn 6000 byte', hidden: true, setup: { files: [{ path: 'r5big.txt', repeatText: 'AB', repeatCount: 3000 }] }, stdin: 'r5big.txt r5bigo.txt 1024\n', expected: '6000', checkFile: { path: 'r5bigo.txt', repeatText: 'BA', repeatCount: 3000 }, hint: 'Xử lý đúng khối đầu tiên ngắn hơn buf_size khi kích thước không chia hết.' },
    { name: 'Test ẩn 5: Tệp nguồn không tồn tại (-1)', hidden: true, stdin: 'missing5.bin out5.bin 16\n', expected: '-1', hint: 'open() nguồn lỗi → in -1.' },
  ],

  'CR-06': [
    { name: 'Test mẫu (bỏ qua thư mục con sub.txt/)', hidden: false, setup: { dirs: ['dir06', 'dir06/sub.txt'], files: [{ path: 'dir06/a.txt', text: '0123456789' }, { path: 'dir06/b.txt', bytes: Array(25).fill(97) }, { path: 'dir06/c.log', bytes: Array(100).fill(98) }] }, stdin: 'dir06 .txt\n', expected: '2 35' },
    { name: 'Test ẩn 1: Phân biệt hoa thường & tên ngắn hơn ext', hidden: true, setup: { dirs: ['dir06b'], files: [{ path: 'dir06b/a', text: '1' }, { path: 'dir06b/X.TXT', text: '1234' }, { path: 'dir06b/ok.c', text: '123456' }] }, stdin: 'dir06b .txt\n', expected: '0 0', hint: 'Kiểm tra name_len >= ext_len và so sánh strcmp phân biệt hoa thường.' },
    { name: 'Test ẩn 2: Bẫy strstr (a.txt.bak không khớp, a.b.txt khớp)', hidden: true, setup: { dirs: ['dir06c'], files: [{ path: 'dir06c/a.txt.bak', text: '123456789' }, { path: 'dir06c/a.b.txt', text: '1234' }, { path: 'dir06c/.txt', text: '12' }] }, stdin: 'dir06c .txt\n', expected: '2 6', hint: 'Phải so khớp ĐUÔI tên tệp (name + name_len - ext_len), cấm dùng strstr()!' },
    { name: 'Test ẩn 3: Thư mục hoàn toàn rỗng (chỉ có . và ..)', hidden: true, setup: { dirs: ['dir06empty'] }, stdin: 'dir06empty .c\n', expected: '0 0', hint: 'Không lỗi khi thư mục không có tệp nào.' },
    { name: 'Test ẩn 4: Có tệp 0 byte & tệp lớn 5000 byte khớp ext', hidden: true, setup: { dirs: ['dir06d'], files: [{ path: 'dir06d/z.c', text: '' }, { path: 'dir06d/big.c', repeatText: 'X', repeatCount: 5000 }] }, stdin: 'dir06d .c\n', expected: '2 5000', hint: 'Tệp 0 byte khớp ext vẫn được tính vào số tệp (+1).' },
    { name: 'Test ẩn 5: Thư mục không tồn tại (-1)', hidden: true, stdin: 'no_such_dir06 .txt\n', expected: '-1', hint: 'opendir() trả NULL → in -1.' },
  ],

  'CR-07': [
    { name: 'Test mẫu (XOR 3 byte, key=15)', hidden: false, setup: { files: [{ path: 'xor07.bin', bytes: [0x41, 0x00, 0xff] }] }, stdin: 'xor07.bin 15\n', expected: '333', checkFile: { path: 'xor07.bin', bytes: [0x4e, 0x0f, 0xf0] } },
    { name: 'Test ẩn 1: Tệp rỗng 0 byte (cấm truyền length=0 vào mmap)', hidden: true, setup: { files: [{ path: 'empty07.bin', text: '' }] }, stdin: 'empty07.bin 99\n', expected: '0', hint: 'Kiểm tra st.st_size == 0 trước mmap() để tránh lỗi EINVAL!' },
    { name: 'Test ẩn 2: key=0 với byte >= 128 (bẫy signed char âm)', hidden: true, setup: { files: [{ path: 'sign07.bin', bytes: [0x80, 0xff, 0x7f] }] }, stdin: 'sign07.bin 0\n', expected: '510', checkFile: { path: 'sign07.bin', bytes: [0x80, 0xff, 0x7f] }, hint: 'Phải ép con trỏ ánh xạ thành unsigned char* (128+255+127 = 510, nếu dùng char* sẽ ra âm!).' },
    { name: 'Test ẩn 3: key=255 (đảo toàn bộ bit)', hidden: true, setup: { files: [{ path: 'inv07.bin', bytes: [0x00, 0xff, 0xaa, 0x55] }] }, stdin: 'inv07.bin 255\n', expected: '510', checkFile: { path: 'inv07.bin', bytes: [0xff, 0x00, 0x55, 0xaa] }, hint: 'Ghi trực tiếp vào vùng MAP_SHARED để cập nhật tệp tại chỗ.' },
    { name: 'Test ẩn 4: Tệp 5000 byte vượt qua ranh giới 1 trang nhớ (4096B)', hidden: true, setup: { files: [{ path: 'page07.bin', repeatBytes: [0x10], repeatCount: 5000 }] }, stdin: 'page07.bin 5\n', expected: '105000', checkFile: { path: 'page07.bin', repeatBytes: [0x15], repeatCount: 5000 }, hint: 'Truyền đúng st.st_size vào mmap() và munmap(), tổng dùng long long.' },
    { name: 'Test ẩn 5: Tệp không tồn tại (-1)', hidden: true, stdin: 'missing07.bin 5\n', expected: '-1', hint: 'open(O_RDWR) < 0 → in -1.' },
  ],

  'CR-08': [
    { name: 'Test mẫu (3 bản ghi + bỏ qua idx=5)', hidden: false, setup: { files: [{ path: 'rec08.bin', bytes: recBytes([[101, 10], [102, 20], [103, 30]]) }] }, stdin: 'rec08.bin 3\n1 5\n0 -3\n5 100\n', expected: '62', checkFile: { path: 'rec08.bin', bytes: recBytes([[101, 7], [102, 25], [103, 30]]) } },
    { name: 'Test ẩn 1: idx âm & cập nhật lặp cùng bản ghi', hidden: true, setup: { files: [{ path: 'rec08b.bin', bytes: recBytes([[1, -10], [2, 50]]) }] }, stdin: 'rec08b.bin 3\n-1 99\n0 15\n0 5\n', expected: '60', checkFile: { path: 'rec08b.bin', bytes: recBytes([[1, 10], [2, 50]]) }, hint: 'Nhớ lseek() lại trước write() và bỏ qua idx < 0.' },
    { name: 'Test ẩn 2: q = 0 (không cập nhật, chỉ tính tổng âm)', hidden: true, setup: { files: [{ path: 'rec08q0.bin', bytes: recBytes([[1, -100000], [2, -100000], [3, 50000]]) }] }, stdin: 'rec08q0.bin 0\n', expected: '-150000', hint: 'Khi q = 0 vẫn phải duyệt hết N bản ghi và in tổng kiểu long long.' },
    { name: 'Test ẩn 3: Bản ghi đầu & cuối (idx=0, idx=N-1) và biên idx=N', hidden: true, setup: { files: [{ path: 'rec08e.bin', bytes: recBytes([[10, 0], [20, 0], [30, 0], [40, 0]]) }] }, stdin: 'rec08e.bin 4\n0 100\n3 -40\n4 999\n-2 999\n', expected: '60', checkFile: { path: 'rec08e.bin', bytes: recBytes([[10, 100], [20, 0], [30, 0], [40, -40]]) }, hint: 'Chỉ số hợp lệ là 0 <= idx < N (bỏ qua idx == N).' },
    { name: 'Test ẩn 4: Kích thước tệp không chia hết cho 8 (-1)', hidden: true, setup: { files: [{ path: 'bad08.bin', bytes: [1, 2, 3, 4, 5] }] }, stdin: 'bad08.bin 0\n', expected: '-1', hint: 'Kiểm tra st.st_size % sizeof(Record) != 0 → in -1.' },
    { name: 'Test ẩn 5: Tệp không tồn tại (-1)', hidden: true, stdin: 'nope08.bin 1\n0 5\n', expected: '-1', hint: 'open(O_RDWR) lỗi → in -1.' },
  ],

  // ======================== PART 2: PROCESS, PIPE & SIGNAL (CR-09 .. CR-16) ========================
  'CR-09': [
    { name: 'Test mẫu (1..25 → 125)', hidden: false, stdin: '1 25\n', expected: '125' },
    { name: 'Test ẩn 1: a == b == 0', hidden: true, stdin: '0 0\n', expected: '0', hint: 'Đoạn 1 phần tử bằng 0 → trả mã thoát 0.' },
    { name: 'Test ẩn 2: a == b > 200 (199..199 và 250..250)', hidden: true, stdin: '250 250\n', expected: '50', hint: '250 % 200 = 50 (không vượt giới hạn 8-bit 0..255).' },
    { name: 'Test ẩn 3: Biên chia hết 200 (1..100000 → 0)', hidden: true, stdin: '1 100000\n', expected: '0', hint: '5000050000 chia hết cho 200 → phần dư là 0.' },
    { name: 'Test ẩn 4: Đoạn lớn 1..100001 (tràn int 32-bit)', hidden: true, stdin: '1 100001\n', expected: '1', hint: '5000150001 vượt 2^31 → phải dùng long long hoặc cộng dồn theo % 200.' },
    { name: 'Test ẩn 5: Ràng buộc tối đa 0..1000000', hidden: true, stdin: '0 1000000\n', expected: '0', hint: '500000500000 % 200 = 0; vòng lặp 10^6 chạy < 5ms.' },
  ],

  'CR-10': [
    { name: 'Test mẫu (5 số âm dương)', hidden: false, stdin: '5\n10 -3 7 8 12\n', expected: '34' },
    { name: 'Test ẩn 1: Toàn số âm lớn', hidden: true, stdin: '4\n-1000000 -1000000 -1000000 -1000000\n', expected: '-4000000', hint: 'Dùng kiểu long long cho biến tổng.' },
    { name: 'Test ẩn 2: 1 phần tử duy nhất', hidden: true, stdin: '1\n999999\n', expected: '999999', hint: 'Nhớ fflush(stdout) trước _exit(0) nếu con in ra stdout!' },
    { name: 'Test ẩn 3: Tổng triệt tiêu về 0', hidden: true, stdin: '6\n1000000 -1000000 500 -500 0 0\n', expected: '0', hint: 'Kiểm tra đóng đủ p[0]/p[1] ở hai tiến trình.' },
    { name: 'Test ẩn 4: 100 phần tử dương lớn (vượt 10^8)', hidden: true, stdin: `100\n${Array(100).fill(1000000).join(' ')}\n`, expected: '100000000', hint: 'Ghi đủ toàn bộ n phần tử qua pipe rồi đóng p[1].' },
    { name: 'Test ẩn 5: Toàn số 0', hidden: true, stdin: '8\n0 0 0 0 0 0 0 0\n', expected: '0', hint: 'Con đọc đủ 8 số 0 và in 0.' },
  ],

  'CR-11': [
    { name: 'Test mẫu (k = 4)', hidden: false, stdin: '4\n', expected: '100' },
    { name: 'Test ẩn 1: k = 1 (nhỏ nhất)', hidden: true, stdin: '1\n', expected: '1', hint: '1^3 = 1.' },
    { name: 'Test ẩn 2: k = 2', hidden: true, stdin: '2\n', expected: '9', hint: '1^3 + 2^3 = 9.' },
    { name: 'Test ẩn 3: k = 10', hidden: true, stdin: '10\n', expected: '3025', hint: 'Mỗi con phải _exit(0) ngay để không sinh cây tiến trình 2^k.' },
    { name: 'Test ẩn 4: k = 12', hidden: true, stdin: '12\n', expected: '6084', hint: '(12*13/2)^2 = 78^2 = 6084.' },
    { name: 'Test ẩn 5: k = 16 (giới hạn tối đa đề bài)', hidden: true, stdin: '16\n', expected: '18496', hint: 'Thu dọn đủ cả 16 tiến trình con bằng waitpid() tránh Zombie.' },
  ],

  'CR-12': [
    { name: 'Test mẫu (lẫn số âm, 0, 1, hợp số)', hidden: false, stdin: '7\n1 2 4 7 11 -5 9\n', expected: '20' },
    { name: 'Test ẩn 1: Không có số nguyên tố nào', hidden: true, stdin: '6\n-7 -2 0 1 4 15\n', expected: '0', hint: 'Các số <= 1 (kể cả số âm -2, 0, 1) không phải số nguyên tố.' },
    { name: 'Test ẩn 2: Biên 2, 3, 4, 5, 9, 25 (chính phương)', hidden: true, stdin: '6\n2 3 4 5 9 25\n', expected: '10', hint: 'Kiểm tra i * i <= x (có dấu <=) để loại đúng 4, 9, 25!' },
    { name: 'Test ẩn 3: Số nguyên tố lớn gần 10^6', hidden: true, stdin: '3\n999983 2 999979\n', expected: '1999964', hint: 'Dùng long long cho tổng và duyệt ước tới căn bậc hai.' },
    { name: 'Test ẩn 4: Trùng lặp cùng số nguyên tố', hidden: true, stdin: '5\n7 7 7 7 7\n', expected: '35', hint: 'Cộng mọi phần tử là số nguyên tố kể cả trùng lặp.' },
    { name: 'Test ẩn 5: 1 phần tử duy nhất (997 là nguyên tố)', hidden: true, stdin: '1\n997\n', expected: '997', hint: 'Đóng đúng 4 đầu ống của 2 pipe p1, p2.' },
  ],

  'CR-13': [
    { name: 'Test mẫu (nhiều dòng & dấu cách thừa)', hidden: false, stdin: 'Advanced   Programming\nTechniques Linux   Process\n', expected: '5' },
    { name: 'Test ẩn 1: Đầu vào rỗng 0 byte', hidden: true, stdin: '', expected: '0', hint: 'Cha phải close(p_in[1]) ngay để wc -w nhận EOF thay vì treo.' },
    { name: 'Test ẩn 2: Chỉ có khoảng trắng, tab và xuống dòng', hidden: true, stdin: '   \t\t  \n   \n\t ', expected: '0', hint: 'Lọc số sạch từ stdout của wc -w bằng sscanf().' },
    { name: 'Test ẩn 3: 1 từ duy nhất không có \\n ở cuối', hidden: true, stdin: 'ELT3296', expected: '1', hint: 'Đọc đến EOF của stdin rồi ghi hết vào p_in[1].' },
    { name: 'Test ẩn 4: Nhiều dòng & dấu câu dính liền từ', hidden: true, stdin: 'a,b c-d\ne f g\nh\n', expected: '6', hint: 'wc -w tách từ theo khoảng trắng (a,b là 1 từ, c-d là 1 từ).' },
    { name: 'Test ẩn 5: Văn bản dài 100 từ trên nhiều dòng', hidden: true, stdin: `${Array(20).fill('linux fork pipe dup2 exec').join('\n')}\n`, expected: '100', hint: 'Ghi hết toàn bộ văn bản qua vòng lặp write() rồi đóng p_in[1].' },
  ],

  'CR-14': [
    { name: 'Test mẫu (m = 12)', hidden: false, stdin: '12\n', expected: '12' },
    { name: 'Test ẩn 1: m = 0 (không gửi tín hiệu)', hidden: true, stdin: '0\n', expected: '0', hint: 'Khi m = 0 không chờ tín hiệu và vẫn waitpid() thu dọn con.' },
    { name: 'Test ẩn 2: m = 1', hidden: true, stdin: '1\n', expected: '1', hint: 'Bắt tay 1 vòng SIGUSR1 → SIGUSR2.' },
    { name: 'Test ẩn 3: m = 50 tín hiệu liên tiếp', hidden: true, stdin: '50\n', expected: '50', hint: 'Dùng volatile sig_atomic_t và bắt tay ACK.' },
    { name: 'Test ẩn 4: m = 150 tín hiệu cường độ cao', hidden: true, stdin: '150\n', expected: '150', hint: 'Phải chặn trước bằng sigprocmask(SIG_BLOCK) + sigsuspend() tránh mất tín hiệu.' },
    { name: 'Test ẩn 5: m = 300 tín hiệu stress test', hidden: true, stdin: '300\n', expected: '300', hint: 'Nếu gửi liên tiếp không đợi ACK, Linux sẽ gộp nhiều SIGUSR1 thành 1!' },
  ],

  'CR-15': [
    { name: 'Test mẫu (n=5, k=3)', hidden: false, stdin: '5 3\n1 -2 3 4 5\n2 3 -1 0 4\n', expected: '13' },
    { name: 'Test ẩn 1: k > n (8 tiến trình cho 2 phần tử)', hidden: true, stdin: '2 8\n10000 -10000\n10000 10000\n', expected: '0', hint: 'Chỉ tạo tối đa min(n, k) tiến trình con.' },
    { name: 'Test ẩn 2: Kết quả âm lớn (tràn int nếu nhiều phần tử)', hidden: true, stdin: '3 2\n10000 10000 10000\n-10000 -10000 -10000\n', expected: '-300000000', hint: 'Ép (long long)A[i] * B[i] trước khi nhân.' },
    { name: 'Test ẩn 3: k = 1 (tuần tự 1 con)', hidden: true, stdin: '4 1\n-5 3 -2 4\n-1 -2 3 5\n', expected: '13', hint: '(-5)*(-1)+3*(-2)+(-2)*3+4*5 = 5-6-6+20 = 13.' },
    { name: 'Test ẩn 4: n = 1, k = 1', hidden: true, stdin: '1 1\n-10000\n10000\n', expected: '-100000000', hint: 'Kiểm tra đúng biên mảng 1 phần tử.' },
    { name: 'Test ẩn 5: n = 25, k = 8 (không chia hết, tràn int 32-bit)', hidden: true, stdin: `25 8\n${Array(25).fill(10000).join(' ')}\n${Array(25).fill(10000).join(' ')}\n`, expected: '2500000000', hint: '25 * 10^8 = 2.5*10^9 vượt int 32-bit (2.14*10^9) → bắt buộc dùng long long!' },
  ],

  'CR-16': [
    { name: 'Test mẫu (5 con hỗn hợp)', hidden: false, stdin: '5\n10 -1 205 -2 0\n', expected: '3 15 2' },
    { name: 'Test ẩn 1: Tất cả bị SIGKILL', hidden: true, stdin: '3\n-5 -10 -1\n', expected: '0 0 3', hint: 'Kiểm tra WIFSIGNALED(st) && WTERMSIG(st) == SIGKILL.' },
    { name: 'Test ẩn 2: Biên modulo 200 (200, 400, 199, 1000)', hidden: true, stdin: '4\n200 400 199 1000\n', expected: '4 199 0', hint: '200%200=0, 400%200=0, 199%200=199, 1000%200=0 → tổng 199.' },
    { name: 'Test ẩn 3: k = 1 thoát bằng 0', hidden: true, stdin: '1\n0\n', expected: '1 0 0', hint: 'c_0 == 0 là thoát bình thường với mã thoát 0 (không phải SIGKILL).' },
    { name: 'Test ẩn 4: k = 1 tự gửi SIGKILL', hidden: true, stdin: '1\n-100\n', expected: '0 0 1', hint: 'c_0 < 0 → kill(getpid(), SIGKILL).' },
    { name: 'Test ẩn 5: k = 8 hỗn hợp tối đa mã thoát', hidden: true, stdin: '8\n199 199 -1 199 -2 399 0 -3\n', expected: '5 796 3', hint: '199*4 + 0 = 796; tổng mã thoát có thể vượt 255 nên cộng dồn ở cha.' },
  ],

  // ======================== PART 3: THREAD & SYNC (CR-17 .. CR-24) ========================
  'CR-17': [
    { name: 'Test mẫu', hidden: false, stdin: '5\n3 -2 10 7 4\n', expected: '22' },
    { name: 'Test ẩn 1: Toàn số âm', hidden: true, stdin: '3\n-1000000 -500000 -1\n', expected: '-1500001', hint: 'Trả con trỏ malloc(sizeof(long long)) qua pthread_join.' },
    { name: 'Test ẩn 2: 1 phần tử duy nhất', hidden: true, stdin: '1\n-42\n', expected: '-42', hint: 'Cấm trả địa chỉ biến cục bộ stack trong luồng con!' },
    { name: 'Test ẩn 3: Tổng âm dương triệt tiêu về 0', hidden: true, stdin: '4\n1000000 -1000000 500000 -500000\n', expected: '0', hint: 'Giải phóng con trỏ trả về bằng free(ret).' },
    { name: 'Test ẩn 4: Tổng lớn hơn 2^31? (3000 phần tử x 10^6 = 3*10^9)', hidden: true, stdin: `3000\n${Array(3000).fill(1000000).join(' ')}\n`, expected: '3000000000', hint: '3*10^9 vượt int 32-bit → bắt buộc dùng long long!' },
    { name: 'Test ẩn 5: Toàn số 0', hidden: true, stdin: '5\n0 0 0 0 0\n', expected: '0', hint: 'Khởi tạo *res = 0 trước khi cộng dồn.' },
  ],

  'CR-18': [
    { name: 'Test mẫu (k=5, inc=100, dec=40)', hidden: false, stdin: '5 100 40\n', expected: '220' },
    { name: 'Test ẩn 1: Xung đột cao k=8, inc=10000, dec=6000', hidden: true, stdin: '8 10000 6000\n', expected: '16000', hint: '4 luồng lẻ (+40000) và 4 luồng chẵn (-24000) = 16000; thiếu mutex sẽ bị race condition ra sai!' },
    { name: 'Test ẩn 2: Kết quả âm (k=2, inc=10, dec=50)', hidden: true, stdin: '2 10 50\n', expected: '-40', hint: 'Luồng 1 lẻ (+10), luồng 2 chẵn (-50) → -40.' },
    { name: 'Test ẩn 3: k = 1 (chỉ có luồng lẻ)', hidden: true, stdin: '1 1234 9999\n', expected: '1234', hint: 'Luồng đánh số 1-based (1 là lẻ → tăng).' },
    { name: 'Test ẩn 4: inc = 0, dec = 0', hidden: true, stdin: '6 0 0\n', expected: '0', hint: 'Không lỗi khi số lượt lặp bằng 0.' },
    { name: 'Test ẩn 5: k = 10 cân bằng inc == dec == 5000', hidden: true, stdin: '10 5000 5000\n', expected: '0', hint: '5 luồng lẻ và 5 luồng chẵn phải triệt tiêu đúng bằng 0 nếu khóa mutex chuẩn.' },
  ],

  'CR-19': [
    { name: 'Test mẫu', hidden: false, stdin: '6 4\n-10 42 7 99 -3 88\n', expected: '99' },
    { name: 'Test ẩn 1: Toàn số âm & k > n', hidden: true, stdin: '3 8\n-100 -5 -999\n', expected: '-5', hint: 'Khởi tạo local_max = a[left] thay vì 0!' },
    { name: 'Test ẩn 2: 1 phần tử cực nhỏ (-10^9)', hidden: true, stdin: '1 4\n-1000000000\n', expected: '-1000000000', hint: 'Chỉ tạo tối đa min(n, k) luồng.' },
    { name: 'Test ẩn 3: Max nằm ở vị trí đầu tiên (index 0)', hidden: true, stdin: '7 3\n1000000000 -10 5 0 99 100 999\n', expected: '1000000000', hint: 'Kiểm tra đúng biên trái của đoạn 0.' },
    { name: 'Test ẩn 4: Max nằm ở vị trí cuối cùng (index n-1)', hidden: true, stdin: '7 3\n-10 -20 -30 -40 -50 -60 777\n', expected: '777', hint: 'Chia đoạn không chia hết (7 chia 3) không được bỏ sót phần tử cuối.' },
    { name: 'Test ẩn 5: Tất cả phần tử bằng nhau (âm)', hidden: true, stdin: '10 4\n-7 -7 -7 -7 -7 -7 -7 -7 -7 -7\n', expected: '-7', hint: 'Hoạt động đúng khi mọi giá trị trùng nhau.' },
  ],

  'CR-20': [
    { name: 'Test mẫu (n = 6)', hidden: false, stdin: '6\n', expected: '1 2 3 4 5 6' },
    { name: 'Test ẩn 1: n = 1 (luồng chẵn không in gì)', hidden: true, stdin: '1\n', expected: '1', hint: 'Luồng chẵn phải thoát sạch khi cur > n mà không bị treo.' },
    { name: 'Test ẩn 2: n = 2 (chẵn nhỏ nhất)', hidden: true, stdin: '2\n', expected: '1 2', hint: 'Đúng thứ tự 1 2.' },
    { name: 'Test ẩn 3: n = 15 (số lẻ)', hidden: true, stdin: '15\n', expected: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15', hint: 'Không dư khoảng trắng ở cuối dòng.' },
    { name: 'Test ẩn 4: n = 40 (nhiều lượt chuyển đổi)', hidden: true, stdin: '40\n', expected: Array.from({ length: 40 }, (_, i) => i + 1).join(' '), hint: 'Dùng while (cur <= n && ...) quanh pthread_cond_wait() chống spurious wakeup.' },
    { name: 'Test ẩn 5: n = 100 (stress đồng bộ 2 luồng)', hidden: true, stdin: '100\n', expected: Array.from({ length: 100 }, (_, i) => i + 1).join(' '), hint: 'Nhớ pthread_cond_signal() trước hoặc sau khi tăng cur để không deadlock.' },
  ],

  'CR-21': [
    { name: 'Test mẫu (k = 4)', hidden: false, stdin: '4\n1 2 3 4\n', expected: '5 13 25 17' },
    { name: 'Test ẩn 1: k = 1 (tự cộng chính mình)', hidden: true, stdin: '1\n-5\n', expected: '50', hint: '(-5)^2 = 25; (0+1)%1 == 0 → b[0] = 25 + 25 = 50.' },
    { name: 'Test ẩn 2: k = 5 có số âm và 0', hidden: true, stdin: '5\n-3 0 2 -1 4\n', expected: '9 4 5 17 25', hint: 'Pha 1: [9,0,4,1,16] → Pha 2: [9,4,5,17,25].' },
    { name: 'Test ẩn 3: k = 2', hidden: true, stdin: '2\n10 -10\n', expected: '200 200', hint: 'Pha 1: [100,100] → Pha 2: [200,200].' },
    { name: 'Test ẩn 4: Giá trị lớn biên 10^4 (b[i] = 2*10^8)', hidden: true, stdin: '3\n10000 -10000 0\n', expected: '200000000 100000000 100000000', hint: 'Dùng long long cho mảng trung gian và kết quả.' },
    { name: 'Test ẩn 5: k = 12 (nhiều luồng chờ tại Barrier)', hidden: true, stdin: '12\n1 1 1 1 1 1 1 1 1 1 1 1\n', expected: Array(12).fill(2).join(' '), hint: 'Bắt buộc dùng pthread_cond_broadcast() thay vì signal() để đánh thức cả 11 luồng còn lại!' },
  ],

  'CR-22': [
    { name: 'Test mẫu (B=2, n=4)', hidden: false, stdin: '2 4\n5 -1 3 2\n', expected: '20' },
    { name: 'Test ẩn 1: B = 1 (bộ đệm 1 ô luân phiên nghiêm ngặt)', hidden: true, stdin: '1 5\n1 2 3 4 5\n', expected: '55', hint: '1*1+2*2+3*3+4*4+5*5 = 55; kiểm tra hàng đợi vòng (idx + 1) % B.' },
    { name: 'Test ẩn 2: Toàn số âm', hidden: true, stdin: '3 3\n-10 -20 -30\n', expected: '-140', hint: '1*(-10) + 2*(-20) + 3*(-30) = -140.' },
    { name: 'Test ẩn 3: B > n (bộ đệm rộng hơn số phần tử)', hidden: true, stdin: '16 2\n100 -50\n', expected: '0', hint: '1*100 + 2*(-50) = 0.' },
    { name: 'Test ẩn 4: n = 1', hidden: true, stdin: '1 1\n-10000\n', expected: '-10000', hint: 'Hoạt động đúng với 1 phần tử duy nhất.' },
    { name: 'Test ẩn 5: Stress B=4, n=1000 (tràn int nếu không dùng long long)', hidden: true, stdin: `4 1000\n${Array(1000).fill(10000).join(' ')}\n`, expected: '5005000000', hint: '(1000*1001/2) * 10000 = 5,005,000,000 vượt int 32-bit → bắt buộc dùng (long long)i * val!' },
  ],

  'CR-23': [
    { name: 'Test mẫu (2P 3C B=2)', hidden: false, stdin: '2 3 2 6\n4 7 -2 5 8 0\n', expected: '10' },
    { name: 'Test ẩn 1: P > n và không có số chẵn', hidden: true, stdin: '5 4 2 3\n1 -3 7\n', expected: '0', hint: 'Đảm bảo tất cả Consumer thoát sạch bằng pthread_cond_broadcast khi active_producers == 0.' },
    { name: 'Test ẩn 2: Số chẵn âm & B = 1', hidden: true, stdin: '3 2 1 4\n-4 -6 3 2\n', expected: '-8', hint: 'Trong C, (-4) % 2 == 0 là đúng cho số chẵn âm.' },
    { name: 'Test ẩn 3: 1 Producer, 8 Consumer (nhiều Consumer tranh nhau)', hidden: true, stdin: '1 8 2 10\n2 4 6 8 10 -2 -4 -6 -8 -10\n', expected: '0', hint: 'Tất cả 8 Consumer phải tỉnh dậy và thoát không deadlock.' },
    { name: 'Test ẩn 4: 8 Producer, 1 Consumer, n = 1', hidden: true, stdin: '8 1 1 1\n1000000\n', expected: '1000000', hint: 'Khởi tạo active_producers = số Producer thực sự TRƯỚC khi gọi pthread_create.' },
    { name: 'Test ẩn 5: 4P 4C B=4 n=100 (tổng lớn kiểu long long)', hidden: true, stdin: `4 4 4 100\n${Array(100).fill(1000000).join(' ')}\n`, expected: '100000000', hint: 'Cộng toàn bộ số chẵn từ tất cả Consumer bằng long long.' },
  ],

  'CR-24': [
    { name: 'Test mẫu', hidden: false, stdin: '3 2 4\n100 200 300\n0 1 50\n1 0 20\n2 2 10\n1 2 -5\n', expected: '2\n70 230 300' },
    { name: 'Test ẩn 1: Giao dịch chéo nhiều luồng + chỉ số sai', hidden: true, stdin: '2 4 5\n1000 1000\n0 1 100\n1 0 40\n0 1 50\n-1 0 10\n0 2 10\n', expected: '3\n890 1110', hint: 'Khóa min(u,v) trước max(u,v) chống deadlock và lọc u, v ngoài [0..M-1].' },
    { name: 'Test ẩn 2: Bỏ qua amount == 0 và amount < 0 (cho phép trừ số dư âm)', hidden: true, stdin: '2 2 5\n50 10\n0 1 60\n0 1 0\n0 1 -20\n0 1 50\n0 1 1\n', expected: '3\n-61 121', hint: 'Theo đúng đề, hợp lệ khi 0 <= u, v < M, u != v và amount > 0 (không lọc theo số dư để kết quả đa luồng xác định).' },
    { name: 'Test ẩn 3: Toàn bộ giao dịch tự chuyển u == v (bẫy self-deadlock)', hidden: true, stdin: '3 4 4\n100 200 300\n0 0 10\n1 1 20\n2 2 30\n0 0 50\n', expected: '0\n100 200 300', hint: 'Phải bỏ qua u == v TRƯỚC khi khóa mutex kẻo tự khóa cùng 1 mutex 2 lần gây deadlock!' },
    { name: 'Test ẩn 4: Stress AB-BA chéo 20 cặp đồng thời (4 luồng)', hidden: true, stdin: `2 4 40\n5000 5000\n${Array(20).fill('0 1 10\n1 0 10').join('\n')}\n`, expected: '40\n5000 5000', hint: '20 lần chuyển 0→1 và 20 lần chuyển 1→0 (10đ) phải hoàn tất 40/40 không deadlock và bảo toàn tổng.' },
    { name: 'Test ẩn 5: Số dư lớn kiểu long long (> 2^31)', hidden: true, stdin: '2 2 3\n1000000000 1000000000\n0 1 1000000\n0 1 1000000\n0 1 1000000\n', expected: '3\n997000000 1003000000', hint: 'Lưu mảng bal[] bằng kiểu long long.' },
  ],

  // ======================== PART 4: PARALLEL & CACHE (CR-25 .. CR-32) ========================
  'CR-25': [
    { name: 'Test mẫu (1..20, d=3, T=4)', hidden: false, stdin: '1 20 3 4\n', expected: '3' },
    { name: 'Test ẩn 1: Đoạn 1 phần tử [9, 9] chia hết cho 3', hidden: true, stdin: '9 9 3 8\n', expected: '1', hint: 'Xử lý đúng khi R - L + 1 < T.' },
    { name: 'Test ẩn 2: Đoạn 1 phần tử chẵn [6, 6] (không phải số lẻ)', hidden: true, stdin: '6 6 3 4\n', expected: '0', hint: '6 chia hết cho 3 nhưng là số chẵn → phải đếm là 0!' },
    { name: 'Test ẩn 3: Không có bội số nào trong đoạn [10, 12], d=7', hidden: true, stdin: '10 12 7 4\n', expected: '0', hint: 'Trả 0 khi không có số thỏa mãn.' },
    { name: 'Test ẩn 4: Đoạn [1, 100000], d=7, T=4', hidden: true, stdin: '1 100000 7 4\n', expected: '7143', hint: '100000/7 = 14285 bội của 7 → ceil(14285/2) = 7143 số lẻ.' },
    { name: 'Test ẩn 5: d = 1 (đếm mọi số lẻ trong [1, 1000000]) với T=8', hidden: true, stdin: '1 1000000 1 8\n', expected: '500000', hint: 'Không khóa mutex trong vòng lặp đếm; dùng local counter.' },
  ],

  'CR-26': [
    { name: 'Test mẫu (n=7, T=3)', hidden: false, stdin: '7 3\n1 -2 3 0 4 -5 2\n', expected: '59' },
    { name: 'Test ẩn 1: T > n & giá trị biên +-10^4', hidden: true, stdin: '2 8\n10000 -10000\n', expected: '200000000', hint: 'Ép (long long)a[i] * a[i] và xử lý T > n.' },
    { name: 'Test ẩn 2: n = 1', hidden: true, stdin: '1 4\n-10000\n', expected: '100000000', hint: '(-10000)^2 = 10^8.' },
    { name: 'Test ẩn 3: Toàn số 0', hidden: true, stdin: '6 4\n0 0 0 0 0 0\n', expected: '0', hint: 'Tổng bình phương mảng 0 phải là 0.' },
    { name: 'Test ẩn 4: n = 30, T = 7 (tràn int 32-bit: 3*10^9)', hidden: true, stdin: `30 7\n${Array(30).fill(10000).join(' ')}\n`, expected: '3000000000', hint: '30 * 10^8 = 3*10^9 vượt int 32-bit → bắt buộc tích lũy bằng long long!' },
    { name: 'Test ẩn 5: T = 1', hidden: true, stdin: '5 1\n-3 -4 5 0 2\n', expected: '54', hint: '9 + 16 + 25 + 0 + 4 = 54.' },
  ],

  'CR-27': [
    { name: 'Test mẫu', hidden: false, stdin: '5 2\n2 -1 4 3 0\n5 6 -2 1 9\n', expected: '-1' },
    { name: 'Test ẩn 1: T > n & giá trị lớn', hidden: true, stdin: '2 6\n10000 10000\n10000 10000\n', expected: '200000000', hint: 'Tính tích bằng (long long)A[i] * B[i].' },
    { name: 'Test ẩn 2: Kết quả âm cực lớn (tràn int 32-bit: -2.5*10^9)', hidden: true, stdin: `25 6\n${Array(25).fill(10000).join(' ')}\n${Array(25).fill(-10000).join(' ')}\n`, expected: '-2500000000', hint: '-2.5*10^9 vượt int 32-bit → bắt buộc dùng long long!' },
    { name: 'Test ẩn 3: Hai vector trực giao (tích vô hướng = 0)', hidden: true, stdin: '4 3\n1 -1 2 -2\n2 2 1 1\n', expected: '0', hint: '2 - 2 + 2 - 2 = 0.' },
    { name: 'Test ẩn 4: n = 1, T = 4', hidden: true, stdin: '1 4\n-9999\n-9999\n', expected: '99980001', hint: 'Âm nhân âm ra dương.' },
    { name: 'Test ẩn 5: T = 1', hidden: true, stdin: '3 1\n-1 -2 -3\n4 5 6\n', expected: '-32', hint: '-4 - 10 - 18 = -32.' },
  ],

  'CR-28': [
    { name: 'Test mẫu', hidden: false, stdin: '8 3\n5 2 5 10 2 0 10 2\n', expected: '4 2 3' },
    { name: 'Test ẩn 1: Hòa tần suất chọn giá trị nhỏ nhất (0 vs 255)', hidden: true, stdin: '6 4\n255 0 255 0 10 10\n', expected: '3 0 2', hint: 'Duyệt 0..255 và chỉ cập nhật mode khi hist[v] > mode_freq (dấu > nghiêm ngặt).' },
    { name: 'Test ẩn 2: Toàn bộ 1 giá trị biên 255', hidden: true, stdin: '5 8\n255 255 255 255 255\n', expected: '1 255 5', hint: 'Đảm bảo vòng reduce duyệt ĐẾN 255 (v <= 255, không phải < 255!).' },
    { name: 'Test ẩn 3: Toàn bộ giá trị 0', hidden: true, stdin: '4 2\n0 0 0 0\n', expected: '1 0 4', hint: 'Giá trị pixel 0 vẫn tính là 1 giá trị khác nhau.' },
    { name: 'Test ẩn 4: n = 1, T = 4', hidden: true, stdin: '1 4\n128\n', expected: '1 128 1', hint: 'Xử lý đúng khi T > n.' },
    { name: 'Test ẩn 5: Tất cả giá trị phân biệt (n=10, mode là min)', hidden: true, stdin: '10 3\n99 50 12 200 255 7 33 19 88 100\n', expected: '10 7 1', hint: 'Mọi giá trị xuất hiện 1 lần → mode phải là giá trị nhỏ nhất (7).' },
  ],

  'CR-29': [
    { name: 'Test mẫu (tìm thấy ở idx=2)', hidden: false, stdin: '6 25 3\n11 4 25 9 30 -7\n', expected: '2' },
    { name: 'Test ẩn 1: Không tồn tại (-1)', hidden: true, stdin: '5 999 4\n1 2 3 4 5\n', expected: '-1', hint: 'Khởi tạo found_idx = -1.' },
    { name: 'Test ẩn 2: Target ở vị trí đầu tiên (index 0)', hidden: true, stdin: '6 1000000000 4\n1000000000 1 2 3 4 5\n', expected: '0', hint: 'Phân biệt chỉ số 0 hợp lệ với không tìm thấy (-1).' },
    { name: 'Test ẩn 3: Target ở vị trí cuối cùng (-10^9)', hidden: true, stdin: '7 -1000000000 4\n10 20 30 40 50 60 -1000000000\n', expected: '6', hint: 'Chia đoạn không chia hết (7/4) không bỏ sót phần tử cuối.' },
    { name: 'Test ẩn 4: n = 1, T = 8 (tìm thấy và không thấy)', hidden: true, stdin: '1 0 8\n0\n', expected: '0', hint: 'T > n vẫn kiểm tra đúng phần tử duy nhất.' },
    { name: 'Test ẩn 5: Mảng 500 phần tử (target ở giữa idx=333)', hidden: true, stdin: `500 333 6\n${Array.from({ length: 500 }, (_, i) => i).join(' ')}\n`, expected: '333', hint: 'Tìm đúng trên mảng lớn vượt ngưỡng kiểm tra sớm 256 phần tử.' },
  ],

  'CR-30': [
    { name: 'Test mẫu (2x3 * 3x2)', hidden: false, stdin: '2 3 2 2\n1 2 3\n4 5 6\n7 8\n9 10\n11 12\n', expected: '58 64\n139 154' },
    { name: 'Test ẩn 1: M=1, T=4 (T > M) và số âm', hidden: true, stdin: '1 2 2 4\n-3 4\n2 -1\n5 6\n', expected: '14 27', hint: 'Tạo tối đa min(M, T) luồng, không dư dấu cách cuối dòng.' },
    { name: 'Test ẩn 2: Ma trận 1x1x1', hidden: true, stdin: '1 1 1 2\n-1000\n1000\n', expected: '-1000000', hint: 'Xử lý đúng kích thước nhỏ nhất.' },
    { name: 'Test ẩn 3: M=5 hàng, T=3 luồng (chia hàng không chia hết)', hidden: true, stdin: '5 2 2 3\n1 0\n0 1\n1 1\n2 -1\n-1 3\n2 3\n4 5\n', expected: '2 3\n4 5\n6 8\n0 1\n10 12', hint: 'Chia đều 5 hàng cho 3 luồng (2+2+1) không bỏ sót hàng cuối.' },
    { name: 'Test ẩn 4: Nhân với ma trận đơn vị 3x3', hidden: true, stdin: '3 3 3 2\n7 -8 9\n0 5 -2\n4 1 6\n1 0 0\n0 1 0\n0 0 1\n', expected: '7 -8 9\n0 5 -2\n4 1 6', hint: 'A * I = A.' },
    { name: 'Test ẩn 5: Ma trận toàn 0', hidden: true, stdin: '2 4 3 4\n1 2 3 4\n5 6 7 8\n0 0 0\n0 0 0\n0 0 0\n0 0 0\n', expected: '0 0 0\n0 0 0', hint: 'Khởi tạo C[i][j] = 0 trước khi cộng dồn.' },
  ],

  'CR-31': [
    { name: 'Test mẫu (n=8, threshold=2, depth=2)', hidden: false, stdin: '8 2 2\n9 -3 5 1 8 5 -10 2\n', expected: '-10 -3 1 2 5 5 8 9' },
    { name: 'Test ẩn 1: Đã sắp ngược & max_depth=0 (tuần tự hoàn toàn)', hidden: true, stdin: '5 2 0\n5 4 3 2 1\n', expected: '1 2 3 4 5', hint: 'Khi max_depth == 0 vẫn phải sắp xếp tuần tự đúng.' },
    { name: 'Test ẩn 2: 1 phần tử', hidden: true, stdin: '1 1 2\n42\n', expected: '42', hint: 'Đoạn 1 phần tử in đúng 42 không dư dấu cách.' },
    { name: 'Test ẩn 3: Toàn bộ phần tử trùng nhau (bẫy lặp vô hạn partition)', hidden: true, stdin: '10 2 3\n7 7 7 7 7 7 7 7 7 7\n', expected: '7 7 7 7 7 7 7 7 7 7', hint: 'Partition phải dịch cả i++ và j-- khi hoán đổi để không lặp vô hạn trên mảng bằng nhau!' },
    { name: 'Test ẩn 4: Đã sắp tăng sẵn với số cực lớn +-10^9', hidden: true, stdin: '6 2 2\n-1000000000 -5 0 0 5 1000000000\n', expected: '-1000000000 -5 0 0 5 1000000000', hint: 'Chú ý không dùng phép trừ a - b khi so sánh biên +-10^9 kẻo tràn int!' },
    { name: 'Test ẩn 5: 30 phần tử âm dương kích hoạt nhiều nhánh luồng song song', hidden: true, stdin: '30 4 3\n15 -9 3 22 0 -100 45 12 12 -1 8 7 6 5 4 3 2 1 -50 99 100 -99 14 28 -3 0 7 8 11 -11\n', expected: '-100 -99 -50 -11 -9 -3 -1 0 0 1 2 3 3 4 5 6 7 7 8 8 11 12 12 14 15 22 28 45 99 100', hint: 'Nhớ pthread_join() trước khi trả về để mảng con trỏ/Task trên stack không bị hủy sớm!' },
  ],

  'CR-32': [
    { name: 'Test mẫu (N=3, B_tile=2, T=2)', hidden: false, stdin: '3 2 2\n1 2 0\n0 1 3\n2 1 1\n1 0 2\n0 3 1\n2 1 0\n', expected: '11 13 13' },
    { name: 'Test ẩn 1: N=1, B_tile=1, T=4 (T > N và số âm)', hidden: true, stdin: '1 1 4\n-7\n6\n', expected: '-42', hint: 'Xử lý đúng khi T > N và số âm.' },
    { name: 'Test ẩn 2: B_tile == N (1 khối duy nhất)', hidden: true, stdin: '2 2 2\n1 2\n3 4\n5 6\n7 8\n', expected: '41 93', hint: 'C = [[19,22],[43,50]] → tổng hàng 41 và 93.' },
    { name: 'Test ẩn 3: N=5 không chia hết cho B_tile=2 và T=3', hidden: true, stdin: '5 2 3\n1 0 0 0 1\n0 1 0 1 0\n0 0 2 0 0\n1 1 1 1 1\n-1 -1 -1 -1 -1\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1\n', expected: '10 10 10 25 -25', hint: 'Vòng tiling phải kẹp biên && i < r_end, && k < N, && j < N!' },
    { name: 'Test ẩn 4: B_tile = 1 (tiling 1x1)', hidden: true, stdin: '3 1 2\n2 -1 3\n0 4 -2\n1 1 1\n1 2 0\n-1 0 1\n2 1 -1\n', expected: '12 -4 5', hint: 'Hàng C: [9,7,-4]→12, [-8,-2,6]→-4, [2,3,0]→5; kiểm tra đúng khi B_tile = 1.' },
    { name: 'Test ẩn 5: Biên +-100 trên ma trận 4x4 (kiểm tra long long)', hidden: true, stdin: '4 3 4\n100 100 100 100\n-100 -100 -100 -100\n100 -100 100 -100\n0 0 0 0\n100 100 100 100\n100 100 100 100\n100 100 100 100\n100 100 100 100\n', expected: '160000 -160000 0 0', hint: 'C[0] toàn 40000 → tổng hàng 160000; không dư dấu cách cuối dòng.' },
  ],

  // ======================== PART 5: DYNAMIC PROGRAMMING (CR-33 .. CR-40) ========================
  'CR-33': [
    { name: 'Test mẫu (n=5)', hidden: false, stdin: '5\n10 15 20 5 10\n', expected: '30' },
    { name: 'Test ẩn 1: n = 1', hidden: true, stdin: '1\n99\n', expected: '99', hint: 'Bậc 1 chỉ có thể bước từ bậc 0 → tốn đúng cost[1].' },
    { name: 'Test ẩn 2: n = 2 (nhảy thẳng 0→2 rẻ hơn 0→1→2)', hidden: true, stdin: '2\n100 5\n', expected: '5', hint: 'dp[2] = cost[2] + min(dp[1], dp[0]) = 5 + 0 = 5.' },
    { name: 'Test ẩn 3: Nhảy bậc chẵn chi phí 0', hidden: true, stdin: '6\n1000000 0 1000000 0 1000000 0\n', expected: '0', hint: '0 → 2 → 4 → 6 tốn đúng 0.' },
    { name: 'Test ẩn 4: Phản ví dụ Tham lam (chọn bước lớn rẻ trước bị hố)', hidden: true, stdin: '4\n1 100 1 1\n', expected: '3', hint: 'Đi 0→1→3→4 tốn 1+1+1 = 3 (nếu tham lam nhảy từ 0→2 tốn 100!).' },
    { name: 'Test ẩn 5: Tổng lớn vượt int 32-bit (5000 bậc x 10^6)', hidden: true, stdin: `5000\n${Array(5000).fill(1000000).join(' ')}\n`, expected: '2500000000', hint: '2500 * 10^6 = 2.5*10^9 vượt int 32-bit → bắt buộc dùng long long!' },
  ],

  'CR-34': [
    { name: 'Test mẫu (CLRS n=8)', hidden: false, stdin: '8\n1 5 8 9 10 17 17 20\n', expected: '22' },
    { name: 'Test ẩn 1: Phản ví dụ Tham lam (p=[1,5,8,9], n=4 → 2+2=10)', hidden: true, stdin: '4\n1 5 8 9\n', expected: '10', hint: 'Tham lam theo đơn giá chọn 3+1=9 là SAI; DP cắt 2+2 thu 5+5=10!' },
    { name: 'Test ẩn 2: Không cắt là tối ưu (để nguyên đoạn n)', hidden: true, stdin: '4\n1 2 3 100\n', expected: '100', hint: 'Vòng trong phải duyệt tới i == j.' },
    { name: 'Test ẩn 3: Cắt toàn bộ thành đoạn độ dài 1', hidden: true, stdin: '5\n10 15 20 25 30\n', expected: '50', hint: '5 * p[1] = 50.' },
    { name: 'Test ẩn 4: n = 1 và bảng giá toàn 0', hidden: true, stdin: '1\n0\n', expected: '0', hint: 'Xử lý đúng n = 1 và giá bằng 0.' },
    { name: 'Test ẩn 5: n = 50 lớn, p[1] = 10^6 (kiểm tra long long)', hidden: true, stdin: `50\n${Array.from({ length: 50 }, (_, i) => (i === 0 ? 1000000 : 1000000)).join(' ')}\n`, expected: '50000000', hint: 'Cắt thành 50 đoạn dài 1 thu 50*10^6.' },
  ],

  'CR-35': [
    { name: 'Test mẫu (lưới 3x4)', hidden: false, stdin: '3 4\n0 0 0 0\n0 1 0 0\n0 0 0 0\n', expected: '4' },
    { name: 'Test ẩn 1: Ô xuất phát (1,1) bị chặn', hidden: true, stdin: '2 2\n1 0\n0 0\n', expected: '0', hint: 'Kiểm tra grid[1][1] == 1 → in 0 ngay.' },
    { name: 'Test ẩn 2: Ô đích (M,N) bị chặn', hidden: true, stdin: '2 2\n0 0\n0 1\n', expected: '0', hint: 'Kiểm tra grid[M][N] == 1 → kết quả phải là 0.' },
    { name: 'Test ẩn 3: Lưới 1x1 trống', hidden: true, stdin: '1 1\n0\n', expected: '1', hint: 'dp[1][1] = 1.' },
    { name: 'Test ẩn 4: Vật cản ở hàng 1 & cột 1 (bẫy khởi tạo biên = 1 hết)', hidden: true, stdin: '3 4\n0 1 0 0\n0 0 0 0\n1 0 0 0\n', expected: '3', hint: 'Ô (1,2) bị chặn nên (1,3),(1,4) KHÔNG được gán dp=1; ô (3,1) bị chặn nên không đi qua nó!' },
    { name: 'Test ẩn 5: Hàng rào vật cản cắt đứt hoàn toàn đường đi', hidden: true, stdin: '3 3\n0 0 1\n0 1 0\n1 0 0\n', expected: '0', hint: 'Đường chéo vật cản chặn hết lối đi → 0.' },
    { name: 'Test ẩn 6: Lưới 20x20 trống (C(38,19) > 2^31 → kiểm tra modulo 10^9+7)', hidden: true, stdin: `20 20\n${Array(20).fill(Array(20).fill(0).join(' ')).join('\n')}\n`, expected: '345263555', hint: 'C(38,19) = 35,345,263,800 % 1000000007 = 345263555 → phải lấy % 1000000007 ở mọi phép cộng!' },
  ],

  'CR-36': [
    { name: 'Test mẫu (bẫy Tham lam [1,5,7], S=11)', hidden: false, stdin: '3 11\n1 5 7\n', expected: '3' },
    { name: 'Test ẩn 1: Bẫy Tham lam kinh điển [1,3,4], S=6 → 2 xu (3+3)', hidden: true, stdin: '3 6\n1 3 4\n', expected: '2', hint: 'Tham lam chọn 4+1+1 = 3 xu (SAI); DP chọn 3+3 = 2 xu!' },
    { name: 'Test ẩn 2: S = 0', hidden: true, stdin: '2 0\n5 10\n', expected: '0', hint: 'Đổi số tiền 0 luôn cần 0 đồng xu.' },
    { name: 'Test ẩn 3: Vô nghiệm (-1)', hidden: true, stdin: '2 7\n2 4\n', expected: '-1', hint: 'Không thể ghép số lẻ 7 từ các mệnh giá chẵn → in -1.' },
    { name: 'Test ẩn 4: Mệnh giá lớn hơn S (không được tràn mảng)', hidden: true, stdin: '3 5\n10 20 5\n', expected: '1', hint: 'Chỉ xét c[j] <= x để không truy cập chỉ số âm dp[x - c[j]]!' },
    { name: 'Test ẩn 5: Mệnh giá trùng lặp & S lớn (S=10000)', hidden: true, stdin: '4 10000\n7 7 13 100\n', expected: '100', hint: '100 đồng xu mệnh giá 100; cẩn thận INF + 1 không tràn int.' },
  ],

  'CR-37': [
    { name: 'Test mẫu (3 vật, W=50)', hidden: false, stdin: '3 50\n10 60\n20 100\n30 120\n', expected: '220' },
    { name: 'Test ẩn 1: Bẫy Balo không giới hạn (Unbounded vs 0/1)', hidden: true, stdin: '2 10\n3 50\n8 60\n', expected: '60', hint: 'Mỗi vật chỉ chọn tối đa 1 lần! Nếu duyệt w xuôi từ 0→W sẽ chọn lặp (3,50) 3 lần thành 150 (SAI!).' },
    { name: 'Test ẩn 2: W = 0', hidden: true, stdin: '2 0\n1 100\n2 200\n', expected: '0', hint: 'Sức chứa W = 0 → giá trị 0.' },
    { name: 'Test ẩn 3: Tất cả đồ vật đều nặng hơn W', hidden: true, stdin: '3 5\n6 100\n10 500\n8 300\n', expected: '0', hint: 'Không nhét được vật nào → in 0.' },
    { name: 'Test ẩn 4: Phản ví dụ Tham lam theo tỷ lệ v/w', hidden: true, stdin: '3 10\n6 65\n5 50\n5 50\n', expected: '100', hint: 'Vật (6,65) có đơn giá 10.83 cao nhất nhưng chọn 2 vật (5,50)+(5,50) = 100 cao hơn!' },
    { name: 'Test ẩn 5: Toàn bộ đồ vật có w nhỏ, v lớn (kiểm tra long long)', hidden: true, stdin: `5 100\n10 1000000\n10 1000000\n10 1000000\n10 1000000\n10 1000000\n`, expected: '5000000', hint: 'Dùng kiểu long long cho mảng dp[].' },
  ],

  'CR-38': [
    { name: 'Test mẫu (ACDBE vs ABCDE)', hidden: false, stdin: 'ACDBE\nABCDE\n', expected: '4\nACDE' },
    { name: 'Test ẩn 1: Không có ký tự chung (EMPTY)', hidden: true, stdin: 'ABC\nXYZ\n', expected: '0\nEMPTY', hint: 'Khi độ dài LCS bằng 0, dòng 2 bắt buộc in EMPTY.' },
    { name: 'Test ẩn 2: Hai chuỗi giống hệt nhau', hidden: true, stdin: 'LINUX\nLINUX\n', expected: '5\nLINUX', hint: 'Truy vết ngược rồi đảo lại để in đúng thứ tự xuôi.' },
    { name: 'Test ẩn 3: Độ dài 1 ký tự khớp & phân biệt hoa thường', hidden: true, stdin: 'aA\nA\n', expected: '1\nA', hint: 'Phân biệt hoa thường (a != A).' },
    { name: 'Test ẩn 4: Quy ước ưu tiên đi LÊN khi hòa dp[i-1][j] == dp[i][j-1]', hidden: true, stdin: 'AB\nBA\n', expected: '1\nB', hint: 'Khi dp[i-1][j] >= dp[i][j-1] (tại (2,2): dp[1][2]=1, dp[2][1]=1), ưu tiên đi lên (i--) → chọn B!' },
    { name: 'Test ẩn 5: Chuỗi con không liên tiếp xen kẽ', hidden: true, stdin: 'AGGTAB\nGXTXAYB\n', expected: '4\nGTAB', hint: 'Đảm bảo truy vết đi đúng khi X[i-1] == Y[j-1] (i--, j--).' },
  ],

  'CR-39': [
    { name: 'Test mẫu (n=7 → 18 / 1 6)', hidden: false, stdin: '7\n1 5 8 9 10 17 17\n', expected: '18\n1 6' },
    { name: 'Test ẩn 1: CLRS n=8 → 22 / 2 6', hidden: true, stdin: '8\n1 5 8 9 10 17 17 20\n', expected: '22\n2 6', hint: 'Duyệt i = 1..j và dùng dấu > nghiêm ngặt để ưu tiên đoạn đầu nhỏ nhất.' },
    { name: 'Test ẩn 2: Không cắt (n=3)', hidden: true, stdin: '3\n1 2 50\n', expected: '50\n3', hint: 'Không dư khoảng trắng ở cuối dòng 2.' },
    { name: 'Test ẩn 3: n = 1', hidden: true, stdin: '1\n42\n', expected: '42\n1', hint: 'Thanh dài 1 chỉ có 1 đoạn cắt dài 1.' },
    { name: 'Test ẩn 4: Bảng giá toàn 0 (bẫy khởi tạo best = 0 làm s[j] = 0 → lặp vô hạn!)', hidden: true, stdin: '4\n0 0 0 0\n', expected: '0\n1 1 1 1', hint: 'Phải khởi tạo best = -1 (không phải 0!) để khi p[i] == 0 vẫn cập nhật s[j] = 1 và không lặp vô hạn!' },
    { name: 'Test ẩn 5: Phản ví dụ Tham lam n=4 (p=[1,5,8,9] → 10 / 2 2)', hidden: true, stdin: '4\n1 5 8 9\n', expected: '10\n2 2', hint: 'Cắt 2 + 2 thu 10 (lớn hơn 3 + 1 = 9).' },
  ],

  'CR-40': [
    { name: 'Test mẫu (5 công việc)', hidden: false, stdin: '5\n1 4 5\n3 5 1\n0 6 8\n4 7 4\n3 8 6\n', expected: '9' },
    { name: 'Test ẩn 1: Chưa sắp xếp & chạm mốc f_1 == s_2 với mốc 10^9', hidden: true, stdin: '3\n500000000 900000000 1000000\n0 500000000 1000000\n100000000 800000000 1500000\n', expected: '2000000', hint: 'f_1 == s_2 được phép ghép; tránh return a.f - b.f trong qsort vì mốc tới 10^9!' },
    { name: 'Test ẩn 2: n = 1', hidden: true, stdin: '1\n0 10 500\n', expected: '500', hint: '1 công việc duy nhất → chọn luôn.' },
    { name: 'Test ẩn 3: Tất cả công việc chồng lấn đôi một (chọn 1 việc lợi nhất)', hidden: true, stdin: '4\n1 10 50\n2 9 120\n3 8 90\n4 7 110\n', expected: '120', hint: 'Không có cặp nào tương thích → chọn công việc lợi nhuận lớn nhất.' },
    { name: 'Test ẩn 4: Phản ví dụ Tham lam theo lợi nhuận lớn nhất & kết thúc sớm nhất', hidden: true, stdin: '3\n1 3 5\n2 5 10\n4 6 8\n', expected: '13', hint: 'Tham lam chọn việc lợi nhất (2,5,10) = 10 là SAI; chọn (1,3,5)+(4,6,8) = 13!' },
    { name: 'Test ẩn 5: Chuỗi 6 việc liên tiếp không chồng lấn với lợi nhuận biên 10^6', hidden: true, stdin: '6\n0 1 1000000\n1 2 1000000\n2 3 1000000\n3 4 1000000\n4 5 1000000\n5 6 1000000\n', expected: '6000000', hint: 'Binary search tìm công việc gần nhất có f_j <= s_i.' },
  ],
};
