// Real Linux GCC executable test suite (Sample + Hidden edge cases) for CR-01 .. CR-50
// Each test supports:
//   name: label shown in result table
//   hidden: true for hidden edge cases (shows hint instead of leaking full raw secret test unless user expands)
//   stdin: standard input fed to compiled C binary
//   expected: expected trimmed stdout
//   hint: diagnostic hint shown when this test fails
//   setup: optional { dirs: [...], files: [{ path, text?, bytes?, mode? }] } created via __attribute__((constructor))
//   checkFile: optional { path, text?, bytes? } verified via __attribute__((destructor))

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
  'CR-01': [
    { name: 'Test mẫu (20 byte văn bản)', hidden: false, setup: { files: [{ path: 'f01.txt', text: 'APT 2025\nLine 2: 99\n' }] }, stdin: 'f01.txt\n', expected: '20 2 7' },
    { name: 'Test ẩn 1: Tệp rỗng 0 byte', hidden: true, setup: { files: [{ path: 'empty01.txt', text: '' }] }, stdin: 'empty01.txt\n', expected: '0 0 0', hint: 'Với tệp 0 byte, read() trả 0 ngay lần đầu → phải in 0 0 0.' },
    { name: 'Test ẩn 2: Tệp nhị phân có byte \\0', hidden: true, setup: { files: [{ path: 'bin01.dat', bytes: [65, 0, 10, 48, 57, 0] }] }, stdin: 'bin01.dat\n', expected: '6 1 2', hint: 'Phải duyệt theo số byte n của read(), cấm dùng strlen() vì byte 0x00 làm cắt chuỗi.' },
    { name: 'Test ẩn 3: Tệp không tồn tại', hidden: true, stdin: 'khong_co_01.txt\n', expected: '-1', hint: 'Khi open() trả < 0 cần in -1 rồi thoát.' },
  ],
  'CR-02': [
    { name: 'Test mẫu (nối vào dst có sẵn)', hidden: false, setup: { files: [{ path: 'src02.txt', text: '_LINUX' }, { path: 'dst02.txt', text: 'HELLO' }] }, stdin: 'src02.txt dst02.txt\n', expected: '11', checkFile: { path: 'dst02.txt', text: 'HELLO_LINUX' } },
    { name: 'Test ẩn 1: Tệp đích chưa tồn tại (O_CREAT)', hidden: true, setup: { files: [{ path: 's2.bin', bytes: [65, 0, 66, 67] }] }, stdin: 's2.bin new_dst02.bin\n', expected: '4', checkFile: { path: 'new_dst02.bin', bytes: [65, 0, 66, 67] }, hint: 'Phải có cờ O_CREAT và quyền 0644, hỗ trợ cả byte \\0.' },
    { name: 'Test ẩn 2: Tệp nguồn không tồn tại', hidden: true, setup: { files: [{ path: 'keep02.txt', text: 'SAFE' }] }, stdin: 'missing02.txt keep02.txt\n', expected: '-1', checkFile: { path: 'keep02.txt', text: 'SAFE' }, hint: 'Mở tệp nguồn TRƯỚC tệp đích; lỗi nguồn thì in -1 và không sửa đích.' },
  ],
  'CR-03': [
    { name: 'Test mẫu (tệp thường 0644)', hidden: false, setup: { files: [{ path: 'meta03.bin', bytes: Array(128).fill(65), mode: 0o644 }] }, stdin: 'meta03.bin\n', expected: 'REG 128 644' },
    { name: 'Test ẩn 1: Tệp thường quyền 0750', hidden: true, setup: { files: [{ path: 'meta03_b.txt', text: 'Hello', mode: 0o750 }] }, stdin: 'meta03_b.txt\n', expected: 'REG 5 750', hint: 'Lọc quyền bằng (st.st_mode & 0777) và in bằng %03o.' },
    { name: 'Test ẩn 2: Không tồn tại (-1)', hidden: true, stdin: 'nope03.bin\n', expected: '-1', hint: 'Nếu stat() == -1 thì in -1.' },
  ],
  'CR-04': [
    { name: 'Test mẫu (offset=6, max=5)', hidden: false, setup: { files: [{ path: 't1_src.txt', text: 'Hello Linux File IO!' }] }, stdin: 't1_src.txt t1_dst.txt 6 5\n', expected: '5', checkFile: { path: 't1_dst.txt', text: 'Linux' } },
    { name: 'Test ẩn 1: offset >= kích thước tệp', hidden: true, setup: { files: [{ path: 's4.txt', text: 'ABC' }] }, stdin: 's4.txt d4.txt 10 5\n', expected: '0', checkFile: { path: 'd4.txt', text: '' }, hint: 'offset >= size vẫn tạo tệp đích rỗng 0 byte và in 0.' },
    { name: 'Test ẩn 2: offset âm (-3)', hidden: true, setup: { files: [{ path: 's4b.txt', text: 'ABC' }] }, stdin: 's4b.txt d4b.txt -3 2\n', expected: '-1', hint: 'Kiểm tra if (offset < 0) in -1 trước khi mở tệp đích.' },
  ],
  'CR-05': [
    { name: 'Test mẫu (buf_size=4 không chia hết)', hidden: false, setup: { files: [{ path: 'rev_in.bin', text: 'ABCDE\n' }] }, stdin: 'rev_in.bin rev_out.bin 4\n', expected: '6', checkFile: { path: 'rev_out.bin', text: '\nEDCBA' } },
    { name: 'Test ẩn 1: Tệp nhị phân chứa byte \\0', hidden: true, setup: { files: [{ path: 'r5.bin', bytes: [1, 0, 2, 0, 3] }] }, stdin: 'r5.bin r5_out.bin 2\n', expected: '5', checkFile: { path: 'r5_out.bin', bytes: [3, 0, 2, 0, 1] }, hint: 'Đảo byte trên mảng unsigned char theo đúng số byte đọc được.' },
    { name: 'Test ẩn 2: Tệp rỗng 0 byte & buf_size <= 0', hidden: true, setup: { files: [{ path: 'r5e.bin', text: '' }] }, stdin: 'r5e.bin r5e_out.bin 8\n', expected: '0', checkFile: { path: 'r5e_out.bin', text: '' }, hint: 'Tệp rỗng tạo tệp đích 0 byte và in 0.' },
  ],
  'CR-06': [
    { name: 'Test mẫu (bỏ qua thư mục con sub.txt/)', hidden: false, setup: { dirs: ['dir06', 'dir06/sub.txt'], files: [{ path: 'dir06/a.txt', text: '0123456789' }, { path: 'dir06/b.txt', bytes: Array(25).fill(97) }, { path: 'dir06/c.log', bytes: Array(100).fill(98) }] }, stdin: 'dir06 .txt\n', expected: '2 35' },
    { name: 'Test ẩn 1: Phân biệt hoa thường & tên ngắn hơn ext', hidden: true, setup: { dirs: ['dir06b'], files: [{ path: 'dir06b/a', text: '1' }, { path: 'dir06b/X.TXT', text: '1234' }, { path: 'dir06b/ok.c', text: '123456' }] }, stdin: 'dir06b .txt\n', expected: '0 0', hint: 'Kiểm tra name_len >= ext_len và so khớp phân biệt hoa thường.' },
    { name: 'Test ẩn 2: Thư mục không tồn tại', hidden: true, stdin: 'no_such_dir06 .txt\n', expected: '-1', hint: 'opendir() trả NULL → in -1.' },
  ],
  'CR-07': [
    { name: 'Test mẫu (XOR 3 byte, key=15)', hidden: false, setup: { files: [{ path: 'xor07.bin', bytes: [0x41, 0x00, 0xff] }] }, stdin: 'xor07.bin 15\n', expected: '333', checkFile: { path: 'xor07.bin', bytes: [0x4e, 0x0f, 0xf0] } },
    { name: 'Test ẩn 1: Tệp rỗng 0 byte (không gọi mmap)', hidden: true, setup: { files: [{ path: 'empty07.bin', text: '' }] }, stdin: 'empty07.bin 99\n', expected: '0', hint: 'Kiểm tra st.st_size == 0 trước mmap() để tránh lỗi EINVAL!' },
    { name: 'Test ẩn 2: Tệp không tồn tại', hidden: true, stdin: 'missing07.bin 5\n', expected: '-1', hint: 'open(O_RDWR) < 0 → in -1.' },
  ],
  'CR-08': [
    { name: 'Test mẫu (3 bản ghi + bỏ qua idx=5)', hidden: false, setup: { files: [{ path: 'rec08.bin', bytes: recBytes([[101, 10], [102, 20], [103, 30]]) }] }, stdin: 'rec08.bin 3\n1 5\n0 -3\n5 100\n', expected: '62', checkFile: { path: 'rec08.bin', bytes: recBytes([[101, 7], [102, 25], [103, 30]]) } },
    { name: 'Test ẩn 1: idx âm & cập nhật lặp cùng bản ghi', hidden: true, setup: { files: [{ path: 'rec08b.bin', bytes: recBytes([[1, -10], [2, 50]]) }] }, stdin: 'rec08b.bin 3\n-1 99\n0 15\n0 5\n', expected: '60', hint: 'Nhớ lseek() lại trước write() và bỏ qua idx < 0.' },
    { name: 'Test ẩn 2: Kích thước tệp không chia hết cho 8', hidden: true, setup: { files: [{ path: 'bad08.bin', bytes: [1, 2, 3, 4, 5] }] }, stdin: 'bad08.bin 0\n', expected: '-1', hint: 'Kiểm tra st.st_size % 8 != 0 → in -1.' },
  ],
  'CR-09': [
    { name: 'Test mẫu (1..25)', hidden: false, stdin: '1 25\n', expected: '125' },
    { name: 'Test ẩn 1: a == b == 0', hidden: true, stdin: '0 0\n', expected: '0', hint: 'Kiểm tra đoạn 1 phần tử bằng 0.' },
    { name: 'Test ẩn 2: Đoạn lớn 1..100000 (tràn int)', hidden: true, stdin: '1 100000\n', expected: '50', hint: 'Tổng = 5000050000 % 200 = 50; nhớ lấy % 200 hoặc dùng long long.' },
  ],
  'CR-10': [
    { name: 'Test mẫu (5 số âm dương)', hidden: false, stdin: '5\n10 -3 7 8 12\n', expected: '34' },
    { name: 'Test ẩn 1: Toàn số âm', hidden: true, stdin: '4\n-1000000 -1000000 -1000000 -1000000\n', expected: '-4000000', hint: 'Dùng kiểu long long cho tổng.' },
    { name: 'Test ẩn 2: 1 phần tử duy nhất', hidden: true, stdin: '1\n999999\n', expected: '999999', hint: 'Đảm bảo cha đóng p[1] sau khi ghi và chờ con.' },
  ],
  'CR-11': [
    { name: 'Test mẫu (k = 4)', hidden: false, stdin: '4\n', expected: '100' },
    { name: 'Test ẩn 1: k = 1', hidden: true, stdin: '1\n', expected: '1', hint: '1^3 = 1.' },
    { name: 'Test ẩn 2: k = 10', hidden: true, stdin: '10\n', expected: '3025', hint: 'Mỗi con phải _exit(0) ngay để không tạo cây tiến trình 2^k.' },
  ],
  'CR-12': [
    { name: 'Test mẫu (lẫn số âm, 0, 1, hợp số)', hidden: false, stdin: '7\n1 2 4 7 11 -5 9\n', expected: '20' },
    { name: 'Test ẩn 1: Không có số nguyên tố nào', hidden: true, stdin: '5\n-7 0 1 4 15\n', expected: '0', hint: 'Các số <= 1 không phải số nguyên tố.' },
    { name: 'Test ẩn 2: Số nguyên tố lớn 999983', hidden: true, stdin: '3\n999983 2 999979\n', expected: '1999964', hint: 'Duyệt ước i*i <= x và dùng long long cho tổng.' },
  ],
  'CR-13': [
    { name: 'Test mẫu (nhiều dòng & dấu cách thừa)', hidden: false, stdin: 'Advanced   Programming\nTechniques Linux   Process\n', expected: '5' },
    { name: 'Test ẩn 1: Đầu vào rỗng 0 byte', hidden: true, stdin: '', expected: '0', hint: 'Cha phải close(p_in[1]) ngay để wc -w nhận EOF.' },
    { name: 'Test ẩn 2: Chuỗi toàn khoảng trắng', hidden: true, stdin: '   \t  \n   \n', expected: '0', hint: 'Lọc số sạch từ output của wc -w bằng sscanf.' },
  ],
  'CR-14': [
    { name: 'Test mẫu (m = 12)', hidden: false, stdin: '12\n', expected: '12' },
    { name: 'Test ẩn 1: m = 0', hidden: true, stdin: '0\n', expected: '0', hint: 'Khi m = 0 không gửi tín hiệu nào và vẫn waitpid thu dọn con.' },
    { name: 'Test ẩn 2: m = 100 tín hiệu liên tiếp', hidden: true, stdin: '100\n', expected: '100', hint: 'Phải bắt tay SIGUSR1/SIGUSR2 để tránh gộp/mất tín hiệu.' },
  ],
  'CR-15': [
    { name: 'Test mẫu (n=5, k=3)', hidden: false, stdin: '5 3\n1 -2 3 4 5\n2 3 -1 0 4\n', expected: '13' },
    { name: 'Test ẩn 1: k > n', hidden: true, stdin: '2 8\n10000 -10000\n10000 10000\n', expected: '0', hint: 'Tạo tối đa min(n, k) tiến trình con.' },
    { name: 'Test ẩn 2: Kết quả âm lớn', hidden: true, stdin: '3 2\n10000 10000 10000\n-10000 -10000 -10000\n', expected: '-300000000', hint: 'Ép (long long)A[i] * B[i].' },
  ],
  'CR-16': [
    { name: 'Test mẫu (5 con hỗn hợp)', hidden: false, stdin: '5\n10 -1 205 -2 0\n', expected: '3 15 2' },
    { name: 'Test ẩn 1: Tất cả bị SIGKILL', hidden: true, stdin: '3\n-5 -10 -1\n', expected: '0 0 3', hint: 'Kiểm tra WIFSIGNALED(st) && WTERMSIG(st) == SIGKILL.' },
    { name: 'Test ẩn 2: Tất cả thoát thường', hidden: true, stdin: '2\n400 199\n', expected: '2 199 0', hint: '400 % 200 == 0, 199 % 200 == 199 → tổng 199.' },
  ],
  'CR-17': [
    { name: 'Test mẫu', hidden: false, stdin: '5\n3 -2 10 7 4\n', expected: '22' },
    { name: 'Test ẩn 1: Toàn số âm', hidden: true, stdin: '3\n-1000000 -500000 -1\n', expected: '-1500001', hint: 'Trả con trỏ malloc(sizeof(long long)) qua pthread_join.' },
    { name: 'Test ẩn 2: 1 phần tử', hidden: true, stdin: '1\n-42\n', expected: '-42', hint: 'Đừng quên free(ret) sau khi đọc.' },
  ],
  'CR-18': [
    { name: 'Test mẫu (k=5, inc=100, dec=40)', hidden: false, stdin: '5 100 40\n', expected: '220' },
    { name: 'Test ẩn 1: Xung đột cao k=8, inc=5000, dec=3000', hidden: true, stdin: '8 5000 3000\n', expected: '8000', hint: '4 luồng lẻ (+20000) và 4 luồng chẵn (-12000) = 8000; cần khóa mutex chuẩn.' },
    { name: 'Test ẩn 2: Kết quả âm (k=2, inc=10, dec=50)', hidden: true, stdin: '2 10 50\n', expected: '-40', hint: 'Luồng 1 (+10), luồng 2 (-50) → -40.' },
  ],
  'CR-19': [
    { name: 'Test mẫu', hidden: false, stdin: '6 4\n-10 42 7 99 -3 88\n', expected: '99' },
    { name: 'Test ẩn 1: Mảng toàn số âm & k > n', hidden: true, stdin: '3 8\n-100 -5 -999\n', expected: '-5', hint: 'Khởi tạo local_max = a[left] thay vì 0!' },
    { name: 'Test ẩn 2: 1 phần tử cực nhỏ', hidden: true, stdin: '1 4\n-1000000000\n', expected: '-1000000000', hint: 'Xử lý đúng khi k > n.' },
  ],
  'CR-20': [
    { name: 'Test mẫu (n = 6)', hidden: false, stdin: '6\n', expected: '1 2 3 4 5 6' },
    { name: 'Test ẩn 1: n = 1 (số lẻ nhỏ nhất)', hidden: true, stdin: '1\n', expected: '1', hint: 'Luồng chẵn phải thoát sạch khi cur > n mà không in gì.' },
    { name: 'Test ẩn 2: n = 15 (số lẻ)', hidden: true, stdin: '15\n', expected: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15', hint: 'Không dư khoảng trắng ở cuối dòng.' },
  ],
  'CR-21': [
    { name: 'Test mẫu (k = 4)', hidden: false, stdin: '4\n1 2 3 4\n', expected: '5 13 25 17' },
    { name: 'Test ẩn 1: k = 1', hidden: true, stdin: '1\n-5\n', expected: '50', hint: '(-5)^2 = 25; b[0] = 25 + 25 = 50.' },
    { name: 'Test ẩn 2: k = 5 có số âm và 0', hidden: true, stdin: '5\n-3 0 2 -1 4\n', expected: '9 4 5 17 25', hint: 'Pha 1: [9,0,4,1,16] → Pha 2: [9,4,5,17,25].' },
  ],
  'CR-22': [
    { name: 'Test mẫu (B=2, n=4)', hidden: false, stdin: '2 4\n5 -1 3 2\n', expected: '20' },
    { name: 'Test ẩn 1: B = 1 (đẩy/lấy luân phiên 1-1)', hidden: true, stdin: '1 5\n1 2 3 4 5\n', expected: '55', hint: '1*1+2*2+3*3+4*4+5*5 = 55.' },
    { name: 'Test ẩn 2: Toàn số âm', hidden: true, stdin: '3 3\n-10 -20 -30\n', expected: '-140', hint: '1*(-10) + 2*(-20) + 3*(-30) = -140.' },
  ],
  'CR-23': [
    { name: 'Test mẫu (2P 3C B=2)', hidden: false, stdin: '2 3 2 6\n4 7 -2 5 8 0\n', expected: '10' },
    { name: 'Test ẩn 1: P > n và không có số chẵn', hidden: true, stdin: '5 4 2 3\n1 -3 7\n', expected: '0', hint: 'Đảm bảo tất cả Consumer thoát sạch bằng pthread_cond_broadcast.' },
    { name: 'Test ẩn 2: Số chẵn âm', hidden: true, stdin: '3 2 1 4\n-4 -6 3 2\n', expected: '-8', hint: 'Trong C, (-4) % 2 == 0 đúng cho số chẵn âm.' },
  ],
  'CR-24': [
    { name: 'Test mẫu', hidden: false, stdin: '3 2 4\n100 200 300\n0 1 50\n1 0 20\n2 2 10\n1 2 -5\n', expected: '2\n70 230 300' },
    { name: 'Test ẩn 1: Giao dịch chéo nhiều luồng + chỉ số sai', hidden: true, stdin: '2 4 5\n1000 1000\n0 1 100\n1 0 40\n0 1 50\n-1 0 10\n0 2 10\n', expected: '3\n890 1110', hint: 'Khóa min(u,v) trước max(u,v) và lọc u,v ngoài [0..M-1].' },
  ],
  'CR-25': [
    { name: 'Test mẫu (1..20, d=3, T=4)', hidden: false, stdin: '1 20 3 4\n', expected: '3' },
    { name: 'Test ẩn 1: Đoạn 1 phần tử [9, 9]', hidden: true, stdin: '9 9 3 8\n', expected: '1', hint: 'Xử lý đúng khi R - L + 1 < T.' },
    { name: 'Test ẩn 2: Đoạn [1, 100000], d=7, T=4', hidden: true, stdin: '1 100000 7 4\n', expected: '7143', hint: '100000/7 = 14285 bội của 7, trong đó ceil(14285/2) = 7143 số lẻ.' },
  ],
  'CR-26': [
    { name: 'Test mẫu (n=7, T=3)', hidden: false, stdin: '7 3\n1 -2 3 0 4 -5 2\n', expected: '59' },
    { name: 'Test ẩn 1: T > n', hidden: true, stdin: '2 8\n10000 -10000\n', expected: '200000000', hint: 'Ép (long long)a[i] * a[i] và không bỏ sót phần tử.' },
  ],
  'CR-27': [
    { name: 'Test mẫu', hidden: false, stdin: '5 2\n2 -1 4 3 0\n5 6 -2 1 9\n', expected: '-1' },
    { name: 'Test ẩn 1: T > n & giá trị lớn', hidden: true, stdin: '2 6\n10000 10000\n10000 10000\n', expected: '200000000', hint: 'Tính tích bằng long long.' },
  ],
  'CR-28': [
    { name: 'Test mẫu', hidden: false, stdin: '8 3\n5 2 5 10 2 0 10 2\n', expected: '4 2 3' },
    { name: 'Test ẩn 1: Hòa tần suất chọn giá trị nhỏ nhất', hidden: true, stdin: '6 4\n255 0 255 0 10 10\n', expected: '3 0 2', hint: 'Duyệt 0..255 và chỉ cập nhật mode khi hist[v] > mode_freq (dấu > nghiêm ngặt).' },
  ],
  'CR-29': [
    { name: 'Test mẫu (tìm thấy ở idx=2)', hidden: false, stdin: '6 25 3\n11 4 25 9 30 -7\n', expected: '2' },
    { name: 'Test ẩn 1: Không tồn tại (-1)', hidden: true, stdin: '5 999 4\n1 2 3 4 5\n', expected: '-1', hint: 'Khởi tạo found_idx = -1.' },
    { name: 'Test ẩn 2: Tìm thấy ở vị trí cuối cùng', hidden: true, stdin: '4 -1000000000 4\n10 20 30 -1000000000\n', expected: '3', hint: 'Đảm bảo không bỏ sót phần tử cuối khi chia đoạn.' },
  ],
  'CR-30': [
    { name: 'Test mẫu (2x3 * 3x2)', hidden: false, stdin: '2 3 2 2\n1 2 3\n4 5 6\n7 8\n9 10\n11 12\n', expected: '58 64\n139 154' },
    { name: 'Test ẩn 1: M=1, T=4 (T > M) và số âm', hidden: true, stdin: '1 2 2 4\n-3 4\n2 -1\n5 6\n', expected: '14 27', hint: 'Tạo tối đa min(M, T) luồng, không dư dấu cách cuối dòng.' },
  ],
  'CR-31': [
    { name: 'Test mẫu', hidden: false, stdin: '8 2 2\n9 -3 5 1 8 5 -10 2\n', expected: '-10 -3 1 2 5 5 8 9' },
    { name: 'Test ẩn 1: Mảng đã sắp ngược & max_depth=0', hidden: true, stdin: '5 2 0\n5 4 3 2 1\n', expected: '1 2 3 4 5', hint: 'Xử lý đúng khi max_depth == 0.' },
    { name: 'Test ẩn 2: 1 phần tử', hidden: true, stdin: '1 1 2\n42\n', expected: '42', hint: 'Đoạn 1 phần tử in đúng 42 không dư dấu cách.' },
  ],
  'CR-32': [
    { name: 'Test mẫu (N=3, B_tile=2, T=2)', hidden: false, stdin: '3 2 2\n1 2 0\n0 1 3\n2 1 1\n1 0 2\n0 3 1\n2 1 0\n', expected: '11 13 13' },
    { name: 'Test ẩn 1: N=1, B_tile=1, T=4', hidden: true, stdin: '1 1 4\n-7\n6\n', expected: '-42', hint: 'Xử lý đúng khi T > N và số âm.' },
  ],
  'CR-33': [
    { name: 'Test mẫu', hidden: false, stdin: '5\n10 15 20 5 10\n', expected: '30' },
    { name: 'Test ẩn 1: n = 1', hidden: true, stdin: '1\n99\n', expected: '99', hint: 'Bậc 1 tốn đúng cost[1].' },
    { name: 'Test ẩn 2: n = 6, cost = 0 ở bậc chẵn', hidden: true, stdin: '6\n1000000 0 1000000 0 1000000 0\n', expected: '0', hint: 'Nhảy 0→2→4→6 tốn 0.' },
  ],
  'CR-34': [
    { name: 'Test mẫu (CLRS n=8)', hidden: false, stdin: '8\n1 5 8 9 10 17 17 20\n', expected: '22' },
    { name: 'Test ẩn 1: Không cắt là tối ưu', hidden: true, stdin: '4\n1 2 3 100\n', expected: '100', hint: 'Đảm bảo vòng trong duyệt tới i == j.' },
    { name: 'Test ẩn 2: Cắt hết thành đoạn 1', hidden: true, stdin: '5\n10 15 20 25 30\n', expected: '50', hint: '5 * 10 = 50.' },
  ],
  'CR-35': [
    { name: 'Test mẫu (lưới 3x4)', hidden: false, stdin: '3 4\n0 0 0 0\n0 1 0 0\n0 0 0 0\n', expected: '4' },
    { name: 'Test ẩn 1: Ô xuất phát (1,1) bị chặn', hidden: true, stdin: '2 2\n1 0\n0 0\n', expected: '0', hint: 'Kiểm tra grid[1][1] == 1 || grid[M][N] == 1.' },
    { name: 'Test ẩn 2: Lưới 1x1 trống', hidden: true, stdin: '1 1\n0\n', expected: '1', hint: 'dp[1][1] = 1.' },
  ],
  'CR-36': [
    { name: 'Test mẫu (bẫy Tham lam)', hidden: false, stdin: '3 11\n1 5 7\n', expected: '3' },
    { name: 'Test ẩn 1: S = 0', hidden: true, stdin: '2 0\n5 10\n', expected: '0', hint: 'S = 0 cần 0 đồng xu.' },
    { name: 'Test ẩn 2: Vô nghiệm (-1)', hidden: true, stdin: '2 7\n2 4\n', expected: '-1', hint: 'Không ghép được 7 từ xu chẵn → in -1.' },
  ],
  'CR-37': [
    { name: 'Test mẫu', hidden: false, stdin: '3 50\n10 60\n20 100\n30 120\n', expected: '220' },
    { name: 'Test ẩn 1: Bẫy chọn lặp 1 vật nhiều lần', hidden: true, stdin: '2 10\n3 50\n8 60\n', expected: '60', hint: 'Balo 0/1 chỉ được chọn vật (3,50) tối đa 1 lần! (Nếu duyệt xuôi sẽ ra sai 150.)' },
    { name: 'Test ẩn 2: W = 0', hidden: true, stdin: '2 0\n1 100\n2 200\n', expected: '0', hint: 'Sức chứa 0 → giá trị 0.' },
  ],
  'CR-38': [
    { name: 'Test mẫu (ACDBE vs ABCDE)', hidden: false, stdin: 'ACDBE\nABCDE\n', expected: '4\nACDE' },
    { name: 'Test ẩn 1: Không có ký tự chung (EMPTY)', hidden: true, stdin: 'ABC\nXYZ\n', expected: '0\nEMPTY', hint: 'Khi độ dài LCS bằng 0, dòng 2 phải in EMPTY.' },
    { name: 'Test ẩn 2: Hai chuỗi giống hệt nhau', hidden: true, stdin: 'LINUX\nLINUX\n', expected: '5\nLINUX', hint: 'Truy vết giữ đúng thứ tự xuôi.' },
  ],
  'CR-39': [
    { name: 'Test mẫu (n=7 ưu tiên đoạn đầu nhỏ nhất)', hidden: false, stdin: '7\n1 5 8 9 10 17 17\n', expected: '18\n1 6' },
    { name: 'Test ẩn 1: n = 8 (CLRS → 2 6)', hidden: true, stdin: '8\n1 5 8 9 10 17 17 20\n', expected: '22\n2 6', hint: 'Dùng p[i] + r[j-i] và dấu > nghiêm ngặt.' },
    { name: 'Test ẩn 2: Không cắt', hidden: true, stdin: '3\n1 2 50\n', expected: '50\n3', hint: 'Không dư dấu cách cuối dòng 2.' },
  ],
  'CR-40': [
    { name: 'Test mẫu', hidden: false, stdin: '5\n1 4 5\n3 5 1\n0 6 8\n4 7 4\n3 8 6\n', expected: '9' },
    { name: 'Test ẩn 1: Input chưa sắp xếp & mốc lớn 10^9', hidden: true, stdin: '3\n500000000 900000000 1000000\n0 500000000 1000000\n100000000 800000000 1500000\n', expected: '2000000', hint: 'f_1 == s_2 được phép ghép; tránh trừ số lớn trong hàm so sánh qsort.' },
  ],
  'CR-41': [
    { name: 'Test mẫu (n = 50)', hidden: false, stdin: '50\n', expected: '12586269025' },
    { name: 'Test ẩn 1: n = 0 và n = 1', hidden: true, stdin: '0\n', expected: '0', hint: 'F(0) = 0.' },
    { name: 'Test ẩn 2: n = 92 (cận trên long long)', hidden: true, stdin: '92\n', expected: '7540113804746346429', hint: 'Dùng kiểu long long và mở khóa mutex trước khi đệ quy.' },
  ],
  'CR-42': [
    { name: 'Test mẫu', hidden: false, setup: { files: [{ path: 'p42.txt', text: '10 -4 25\n0 -9 5\n' }] }, stdin: 'p42.txt\n', expected: '40' },
    { name: 'Test ẩn 1: Không có xuống dòng cuối tệp & toàn số âm', hidden: true, setup: { files: [{ path: 'p42b.txt', text: '-5 0 -10 7' }] }, stdin: 'p42b.txt\n', expected: '7', hint: 'Nhớ xử lý số cuối cùng khi tệp kết thúc ngay sau chữ số.' },
    { name: 'Test ẩn 2: Tệp không tồn tại (-1)', hidden: true, stdin: 'missing42.txt\n', expected: '-1', hint: 'Con gửi -1 qua pipe cho cha.' },
  ],
  'CR-43': [
    { name: 'Test mẫu (byte 0x41)', hidden: false, setup: { files: [{ path: 'f43.bin', bytes: [0x41, 0x00, 0x41, 0x42, 0x00, 0x41, 0x10, 0x41, 0x00, 0x41] }] }, stdin: 'f43.bin 65 4\n', expected: '5' },
    { name: 'Test ẩn 1: Đếm byte 0x00 (target = 0)', hidden: true, setup: { files: [{ path: 'f43b.bin', bytes: [0x00, 0xff, 0x00, 0x01, 0x00] }] }, stdin: 'f43b.bin 0 4\n', expected: '3', hint: 'Mỗi luồng mở fd riêng và so sánh unsigned char.' },
    { name: 'Test ẩn 2: Tệp rỗng 0 byte & tệp thiếu', hidden: true, setup: { files: [{ path: 'f43e.bin', text: '' }] }, stdin: 'f43e.bin 65 4\n', expected: '0', hint: 'size == 0 in 0 ngay.' },
  ],
  'CR-44': [
    { name: 'Test mẫu', hidden: false, setup: { files: [{ path: 'ks44_in.txt', text: '4 7\n1 1\n3 4\n4 5\n5 7\n' }] }, stdin: 'ks44_in.txt ks44_out.txt\n', expected: '9', checkFile: { path: 'ks44_out.txt', text: '9\n' } },
    { name: 'Test ẩn 1: Tệp nguồn lỗi (-1)', hidden: true, stdin: 'missing44.txt out44.txt\n', expected: '-1', hint: 'open(src) < 0 → in -1.' },
  ],
  'CR-45': [
    { name: 'Test mẫu', hidden: false, stdin: '7 3\n15 -42 8 99 0 -3 74\n', expected: '-42 99' },
    { name: 'Test ẩn 1: k > n & 1 phần tử âm', hidden: true, stdin: '1 8\n-1000000000\n', expected: '-1000000000 -1000000000', hint: 'c = min(n, k) và khởi tạo mn = mx = a[L].' },
  ],
  'CR-46': [
    { name: 'Test mẫu', hidden: false, stdin: '4 10 4\n6 30\n3 14\n4 16\n2 9\n', expected: '46' },
    { name: 'Test ẩn 1: T > W + 1', hidden: true, stdin: '2 2 8\n1 10\n2 25\n', expected: '25', hint: 'Chia W + 1 trạng thái [0..W] an toàn khi T > W + 1.' },
  ],
  'CR-47': [
    { name: 'Test mẫu', hidden: false, stdin: 'AGGTAB\nGXTXAYB\n', expected: '4' },
    { name: 'Test ẩn 1: Ký tự cuối khác nhau (tách 2 luồng)', hidden: true, stdin: 'ABCDGH\nAEDFHR\n', expected: '3', hint: 'Không giữ mutex khi gọi đệ quy hoặc pthread_join.' },
    { name: 'Test ẩn 2: Không có ký tự chung', hidden: true, stdin: 'AAA\nBBB\n', expected: '0', hint: 'Trả về 0.' },
  ],
  'CR-48': [
    { name: 'Test mẫu (có tệp thiếu & byte 0xFF)', hidden: false, setup: { files: [{ path: 'f1.bin', text: 'AB' }, { path: 'f3.bin', bytes: [0x00, 0xff, 0x01] }] }, stdin: '3 2\nf1.bin\nmissing48.bin\nf3.bin\n', expected: '131 -1 256' },
    { name: 'Test ẩn 1: Tệp rỗng 0 byte & T > k', hidden: true, setup: { files: [{ path: 'e48.bin', text: '' }] }, stdin: '1 8\ne48.bin\n', expected: '0', hint: 'Tệp rỗng cho tổng 0; unsigned char để 0xFF = 255.' },
  ],
  'CR-49': [
    { name: 'Test mẫu (lọc byte không in được)', hidden: false, setup: { files: [{ path: 'raw49.bin', bytes: [72, 105, 33, 0, 1, 127, 10, 79, 75] }] }, stdin: 'raw49.bin clean49.txt\n', expected: '1 6', checkFile: { path: 'clean49.txt', text: 'Hi!\nOK' } },
    { name: 'Test ẩn 1: Nguồn không tồn tại (-1 -1)', hidden: true, stdin: 'missing49.bin out49.txt\n', expected: '-1 -1', hint: 'Con thoát _exit(1), cha in "-1 -1".' },
  ],
  'CR-50': [
    { name: 'Test mẫu (2 bộ dữ liệu)', hidden: false, setup: { files: [{ path: 'batch50.txt', text: '2\n4\n1 5 8 9\n5\n2 5 7 8 10\n' }] }, stdin: 'batch50.txt out50.txt 2\n', expected: '22', checkFile: { path: 'out50.txt', text: '10\n12\n' } },
    { name: 'Test ẩn 1: Nguồn lỗi (-1)', hidden: true, stdin: 'missing50.txt out50b.txt 2\n', expected: '-1', hint: 'open(src) < 0 → in -1.' },
  ],
};
