# Property Renting App
Property Renting Web App adalah sebuah aplikasi e-commerce yang merupakan aplikasi 
berbasis web yang digunakan untuk membantu pengguna nya untuk melakukan komparasi 
harga tempat penginapan berdasarkan tanggal. Harga tiap penginapan akan berbeda dan 
dipengaruhi oleh beberapa faktor seperti hari libur nasional, hari libur disertai cuti bersama, dan 
tanggal tanggal tertentu yang diatur secara manual. 

# Main Features 
    ● Membuat aplikasi berbasis web dengan approach mobile first 
    ● Aplikasi memiliki dua jenis role, yaitu user dan tenant 
    ● User dapat melihat tempat penginapan berdasarkan destinasi dan tanggal ketersediaan 
      yang dipilih 
    ● Daftar tempat penginapan yang muncul dapat diberikan filter dengan ketentuan, harga 
      termurah ke termahal serta sebaliknya. 
    ● User dapat melihat perbandingan suatu tempat penginapan berdasarkan tanggal yang 
      berbeda 
    ● Jika tempat penginapan tersebut tidak tersedia pada suatu tanggal, maka berikan tanda 
      bahwa tidak adanya ketersediaan tempat tersebut. 
    ● Tenant dapat menentukan tanggal tanggal tertentu yang dapat mempengaruhi harga 
      dari tempat yang disewakan untuk menginap 
    ● Tenant dapat mengelola ketersediaan tempat menginap secara daring 
    ● Tiap tenant dapat menyewakan lebih dari satu jenis kamar atau ruangan 
    ● Tenant dapat melihat laporan penjualan 
    ● Review tempat penginapan dapat dilakukan ketika user selesai menginap berupa 
      komentar yang bersifat satu arah 
    ● Key points : 
        ○ Harga suatu tempat penginapan memiliki harga utama, namun harga tersebut 
          dapat berubah secara prosentase maupun secara nominal secara otomatis 
          berdasarkan tanggal tanggal tertentu. 
        ○ User tidak bisa melihat halaman tenant 
        ○ Setiap tenant hanya bisa melihat informasi terhadap tempat yang dia sewakan 
          saja. 

# User 
    ● User di sini merupakan calon penyewa tempat penginapan 
    ● User diharuskan memilih kota destinasi tujuan, tanggal perkiraan menginap dan durasi-
      nya, dan jumlah orang yang akan menginap terlebih dahulu pada landing page. 
    ● Setelah user mengisi informasi pada form landing page, user akan mendapatkan 
      informasi daftar tempat penginapan berdasarkan kota destinasi pilihan user tersebut 
    ● Jika user sudah memilih tempat penginapan dari daftar yang diberikan, maka 
      selanjutnya user akan diberikan informasi detail terkait tempat tersebut. 
    ● Pada halaman informasi detail yang ditampilkan dari suatu tempat penginapan, user 
      dapat melakukan pengecekan harga pada tanggal lainnya berdasarkan tempat tersebut, 
      dimana akan ada kalender yang akan menampilkan harga pada setiap tanggal yang 
      ditampilkan. 
    ● Setelah menentukan tempat dan tanggal, user dapat melakukan pembookingan 
      terhadap tempat tersebut. Tempat penginapan yang di booking harus segera dibayarkan 
      paling lambat dua jam setelah pemesanan tempat dilakukan. Jika tidak, maka otomatis 
      pemesanan akan dibatalkan dan penginapan tersebut dapat disewakan kembali  
    ● User diwajibkan untuk melakukan registrasi dan login pada aplikasi jika ingin melakukan 
      pemesanan. 

# Tenant 
    ● Tenant merupakan pengguna aplikasi yang bertugas untuk mengelola tempat 
      penginapan yang akan disewakan pada aplikasi 
    ● Untuk dapat menyewakan tempat penginapan, seorang tenant diwajibkan untuk 
      mendaftar dan masuk ke dalam aplikasi untuk bisa memasarkan dan mengelola 
      penginapan mereka secara daring. 
    ● Tenant dapat menentukan harga untuk tempat penginapan yang mereka sewakan 
      beserta detail lokasi, jumlah orang yang dapat ditampung serta harga pada tanggal 
      tanggal tertentu. 
    ● Tenant dapat menerima ataupun menolak pesanan yang dilakukan oleh user. 
    ● Tenant dapat melihat laporan pendapatan dari hasil penyewaan tempat penginapannya. 

# Order Statuses 
  Berikut ini beberapa status pesanan yang ada pada aplikasi. Tidak menutup kemungkinan untuk 
  menyesuaikan status pesanannya masing masing.

    ● Menunggu Pembayaran 
        ○ Status ketika user pertama kali membuat pesanan. Pada tahap ini user harus 
          melakukan pembayaran dan mengupload bukti bayar terlebih dahulu. 
    ● Menunggu Konfirmasi Pembayaran 
        ○ Tenant dapat mengecek dan mengkonfirmasi pembayaran yang dilakukan oleh 
          user, kemudian mengubah statusnya menjadi “Dikonfirmasi” 
    ● Dibatalkan 
        ○ Status ini akan muncul ketika user membatalkan pesanan (hanya boleh sebelum 
          pembayaran) atau ketika tenant membatalkan pesanan (untuk pembayaran yang 
          sudah diterima, akan dikembalikan di luar sistem) 

# Features 

## Feature 1 
### Homepage / Landing Page
Homepage / landing page ini adalah halaman awal yang akan muncul ketika aplikasi diakses. 
Pada fitur ini student diminta untuk membuat : 
● Homepage / Landing Page 
    ○ Navigation bar : berisikan menu-menu utama dari aplikasi yang akan dibuat. 
    ○ Hero section : berisikan informasi umum atau promosi dalam bentuk carousel 
    ○ Property list : menampilkan list properti yang tersedia 
        ■ Form kota destinasi dan tanggal berangkat serta durasi 
        ■ Form destinasi berupa dropdown 
        ■ Pemilihan tanggal menggunakan kalender 
    ○ Footer : berisikan informasi tambahan dari aplikasi yang dibuat. 

### Tenant Authentication and Profiles
Terdapat 2 jenis user yang mungkin akan ada pada aplikasi : user dan tenant. Masing masing 
jenis user ini akan memiliki akses dan fitur yang berbeda, dan semua fitur yang dijelaskan di 
bawah ini wajib untuk diimplementasi pada dua jenis user tersebut, dengan menu yang 
terpisah :
    ● User Authorization 
        ○ User dan tenant yang belum terdaftar dan terverifikasi, akan di-redirect ke 
          homepage ketika akses halaman yang seharusnya tidak diperbolehkan untuk 
          diakses (contohnya halaman profil) 
        ○ Untuk fitur tertentu yang tidak bisa digunakan maka akan disabled 
        ○ Muncul keterangan atau notifikasi bahwa user belum terdaftar atau belum 
          terverifikasi 
        ○ Masing masing jenis user memiliki akses yang berbeda satu sama lainnya. 
          Contoh misalnya ketika sebuah akun didaftarkan untuk menjadi tenant, maka 
          dia tidak bisa mengakses fitur fitur yang ada pada user biasa, dan begitu juga 
          sebaliknya 
    ● User Registration 
        ○ User dan tenant dapat melakukan registrasi pada aplikasi 
        ○ Halaman untuk registrasi kedua jenis user ini akan berbeda karena pastinya 
          akan ada perbedaan data yang harus disubmit 
        ○ Proses registrasi bisa menggunakan email dan menggunakan social login 
          (google / fb / twitter dll) 
        ○ User tidak dapat menggunakan email yang sudah terdaftar 
        ○ Untuk registrasi menggunakan email, tidak perlu untuk memasukan password 
          pada tahap ini 
        ○ Untuk registrasi menggunakan email, user akan dikirimkan email untuk dapat 
          memverifikasi data dan juga memasukan password 
    ● Email Verification and Set Password 
        ○ Setelah proses registrasi, terdapat proses verifikasi user yang dikirimkan melalui 
          email 
        ○ Verifikasi hanya boleh dilakukan sekali dan memiliki batas waktu maksimal satu 
          jam setelah email dikirim. Jika sudah lewat dari satu jam,  
        ○ Pada halaman verifikasi, disediakan juga sebuah form untuk memasukan 
          password 
        ○ Proses verifikasi dilakukan bersamaan dengan memasukan password 
        ○ Password harus di enkripsi di database 
        ○ User akan diminta untuk login kembali setelah proses verifikasi selesai 
        ○ User yang belum terverifikasi tidak bisa membuat pesanan 
        ○ User dapat memverifikasi ulang email, jika statusnya belum terverifikasi 
    ● User Login 
        ○ User dapat login ke dalam aplikasi menggunakan email dan password atau 
          social login 
        ○ Halaman untuk login kedua user akan berbeda. 
        ○ Setelah login maka masing masing akan diarahkan ke masing masing halaman 
          sesuai dengan jenisnya. 
    ● Reset Password 
        ○ User dapat mereset password mereka melalui fitur reset password 
        ○ Pada saat di-submit, akan dikirimkan email untuk memproses reset password 
        ○ Reset password hanya boleh dilakukan sekali per request 
        ○ Terdapat dua halaman : 
            ■ Reset Password → untuk mengisi data email yang akan direset dan 
              proses pengiriman link reset password ke email yang sesuai 
            ■ Confirm Reset Password → untuk mengkonfirmasi reset password serta 
              memasukan password yang baru 
        ○ Fitur ini hanya dapat digunakan untuk user yang melakukan registrasi 
          menggunakan email dan password (bukan social login) 
    ● User Profile 
        ○ User dapat melihat detail profil mereka. 
        ○ User dapat memperbarui data personal, termasuk password dan juga foto profil. 
        ○ Validasi terhadap foto yang diupload, ekstensi yang diperbolehkan hanya .jpg, 
          .jpeg, .png dan .gif dan juga maksimum ukurannya adalah 1MB. 
        ○ User dapat memperbarui email, tetapi wajib untuk diverifikasi ulang 
        ○ User dapat memverifikasi ulang email, jika statusnya belum terverifikasi 

## Property Management 
Tenant dapat membuat, memperbarui ataupun menghapus properti, tenant juga bisa mengatur 
tanggal tertentu untuk menaikkan harga. Harga properti yang diakses user adalah harga 
menyesuaikan tanggal tertentu yang sudah diatur tenant. Student diminta untuk membuat : 
● Property Catalog & Search 
    ○ User dapat melihat daftar properti yang ada pada aplikasi berdasarkan form filter 
      pada landing page. Properti yang ditampilkan hanya jika property tersebut masih 
      belum disewa oleh seseorang. 
    ○ Price yang muncul pada suatu property merupakan price dari sebuah room yang 
      available dengan harga terendah. 
    ○ Didalam property list harus ada : 
        ■ Pagination 
        ■ Filter by : property name, category 
        ■ Sort by : name and price (asc - des) 
        ■ Server side processing 
● Property Detail 
    ○ Halaman detail informasi tentang sebuah properti 
    ○ Dapat menampilkan jenis room dari sebuah properti yang dipilih 
    ○ User dapat melihat dan memilih tanggal lain melalui kalender. Pada kalender 
      tersebut user juga dapat melihat perbandingan harga di setiap tanggalnya paling 
      kurang dalam satu bulan yang ditampilkan pada kalender tersebut. 
● Property Category Management 
    ○ Tenant dapat membuat, mengupdate dan menghapus data property category 
● Property Management 
    ○ Tenant dapat melihat daftar properti yang mereka sewakan dengan detail jenis 
      room di dalamnya 
    ○ Tenant dapat membuat, mengupdate dan menghapus data property and room 
    ○ Field yang wajib ada : 
        ■ Name 
        ■ Category → Based on property category 
        ■ Description 
        ■ Picture 
        ■ Room 
● Room Management 
    ○ Satu properti bisa memiliki beberapa jenis room yang dapat disewakan 
    ○ Field wajib: 
        ■ Room type or name 
        ■ Price 
        ■ Description 
● Room Availability and Peak Season Rate 
    ○ Tenant dapat menentukan tanggal tanggal tertentu dimana room dapat 
      disewakan atau tidak 
    ○ Tenant dapat menentukan tanggal-tanggal tertentu yang terdapat kenaikan harga 
      (misal: libur panjang, tanggal merah, etc) 
● Peak Season Rate Management 
    ○ Tenant dapat menaikan harga pada tanggal tanggal tertentu (long weekend, 
      public holiday, etc) 
    ○ Perubahan harga dapat menggunakan nominal atau pun persentase  
    ○ Penyesuaian harga dapat dilakukan secara keseluruhan tanggal yang di set, 
      atau bisa pada tanggal tertentu saja 

## Feature 2 
User Transaction Process    
User dapat melanjutkan ke proses transaksi setelah memilih properti dan kamar yang sesuai, di 
dalam proses transaksi user mengupload bukti pembayaran transaksi. User juga dapat melihat 
riwayat transaksi yang pernah dilakukan. 
● Room Reservation 
    ○ User dapat membuat pesanan baru berdasarkan tempat penginapan yang dipilih, 
      dan berdasarkan ketersediaan room pada tanggal yang dipilih maupun durasi 
      yang ditentukan. 
    ○ Pesanan yang baru dibuat, belum bisa diproses oleh tenant sebelum dilakukan 
      upload bukti pembayaran 
    ○ Pesanan yang baru dibuat, bisa diproses secara otomatis jika pembayaran 
      dilakukan melalui payment gateway 
● Upload Payment Proof 
    ○ Untuk metode pembayaran secara transfer manual, user dapat mengupload bukti 
      bayar untuk dapat melanjutkan proses 
    ○ Terdapat batasan waktu untuk melakukan upload bukti pembayaran yaitu sekitar 
      1 jam. Jika user belum upload bukti pembayaran, maka proses booking akan 
      secara otomatis dibatalkan.  
    ○ Validasi terhadap gambar yang diupload, ekstensi yang diperbolehkan hanya .jpg 
      atau .png 
    ○ Validasi max size 1MB 
● Order List 
    ○ User dapat melihat daftar pesanan yang sedang berlangsung maupun yang 
      sudah selesai (sesuai dengan status pesanan yang tersedia) 
    ○ User dapat mencari pesanan berdasarkan tanggal dan no order 
● Cancel Order 
    ○ User hanya dapat membatalkan pesanan sebelum user melakukan upload bukti 
      bayar 
    ○ Proses cancel order dapat terjadi apabila user tidak melakukan pembayaran 
      sesuai tenggat waktu yang diberikan secara otomatis 

## Tenant Transaction Management 
Tenant dapat menyetujui atau menolak bukti transaksi yang user kirim sebelumnya, transaksi 
yang bisa di konfirmasi hanya transaksi yang ada di properti yang tenant miliki sendiri. Apabila 
tenant menyetujui transaksi tersebut, sistem otomatis mengirim detail kamar dan transaksi ke 
email penyewa. 
● Order List 
    ○ Tenant dapat melihat daftar pesanan yang dibedakan berdasarkan status 
      pemesanan 
● Confirm Payment (Manual Transfer) 
    ○ Tenant dapat mengkonfirmasi bukti pembayaran user 
    ○ Apabila ditolak, maka status pesanan akan kembali ke Menunggu Pembayaran 
    ○ Apabila diterima, maka status pesanan akan berubah menjadi Diproses 
    ○ Ada notifikasi ke user saat pembayaran diterima 
● Order Reminder 
    ○ Tenant dapat mengirimkan email secara otomatis, setelah pembayaran user 
      terkonfirmasi 
    ○ Isi dari email tersebut berupa detail pemesanan user, dan tata cara penggunaan 
      dan aturan dalam penggunaan properti tersebut. 
    ○ H-1 pada tanggal sewa transaksi yang dibuat seorang user, akan diberikan email 
      sebagai bentuk pengingat untuk melakukan check-in. Email dikirimkan secara 
      otomatis melalui sistem. 
● Cancel User Order 
    ○ Tenant hanya dapat membatalkan pesanan, ketika status bukti pembayaran 
      belum di upload 
    ○ Ada pop-up konfirmasi ke tenant sebelum proses dilanjutkan 

## Review 
User bisa memberikan review ke properti yang telah dia sewa sebelumnya. 
● Review 
    ○ Setelah tanggal check-out, user dapat memberikan review berupa komentar 
      pada properti tersebut. Review hanya bisa diberikan satu kali pada satu kali 
      proses checkin-checkout. 
    ○ Tenant dapat membalas review yang telah disubmit oleh user 

## Report & Analysis 
● Sales Report 
    ○ Tenant dapat melihat laporan penjualan 
    ○ Laporan penjualan berdasarkan : 
        ■ Property 
        ■ Transaction 
        ■ User 
    ○ Sort by : date, total penjualan 
    ○ Filter by : date (range) 
● Property Report 
    ○ Tenant dapat melihat properti dan juga kamar yang dimiliki berdasarkan status 
      ketersediaannya dalam bentuk kalender  

## References 
● Dapat menggunakan OpenCage atau free API lainnya untuk mendapatkan posisi 
  geolocation berdasarkan provinsi dan kota 

## Standardization

Validation 
● Semua input dari user harus divalidasi (client dan server) 
● Untuk input yang berupa file (bisa juga gambar), harus divalidasi extensionnya dan juga 
  ukuran file yang bisa diterima 
● Semua proses yang krusial, harus ada approval dari user terlebih dahulu sebelum di 
  proses (misalkan hapus data tertentu) 
Pagination, Filtering and Sorting 
● Semua tampilan dalam bentuk list (misalnya product list, order list atau user list) harus 
  menggunakan pagination, filter dan sort. Semuanya diproses di server (tidak 
  diperbolehkan untuk diproses di client)

Frontend 
● Wajib responsive minimal ukuran mobile dan web 
● Design yang digunakan dapat dimengerti oleh penguji maupun user umum yang akan 
  menggunakan web app tersebut 
● Tampilan dibuat semenarik mungkin, bukan sesederhana nya 
● Penamaan file harus jelas, merepresentasikan kegunaannya 
● Perhatikan penggunaan ekstensi file (jsx di gunakan ketika ada unsur html di dalam js) 
● Title dan favicon disesuaikan dengan project yang dikerjakan

Backend 
● Penggunaan method rest api yang sesuai dengan kaidah nya merujuk ke sini 
● Terapkan authorization pada api yang hanya bisa diakses oleh user tertentu

Clean Code 
● Dalam setiap file, maksimal baris code adalah 200 baris. Jika lebih harus di-refactor 
  terlebih dahulu 
● Penggunaan log yang tidak terpakai harus dibersihkan sebelum masuk ke production 
● Penggunaan code yang tidak terpakai harus dibersihkan 
● Penulisan function maksimal 15 baris, jika lebih harus di re-factor