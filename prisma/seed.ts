import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 관리자 유저
  const admin = await prisma.user.upsert({
    where: { email: "admin@yuhan.ac.kr" },
    update: {},
    create: {
      name: "관리자",
      email: "admin@yuhan.ac.kr",
      status: "ADMIN",
    },
  });

  // 공지사항
  await prisma.notice.createMany({
    skipDuplicates: true,
    data: [
      { title: "2026년 정기 총동문회 개최 안내", content: "2026년 정기 총동문회가 다음과 같이 개최될 예정입니다.\n\n일시: 2026년 10월 15일(토) 오후 2시\n장소: 유한공업고등학교 대강당\n\n많은 참여 바랍니다.", authorId: admin.id },
      { title: "장학금 신청 안내 (2026학년도)", content: "2026학년도 장학금 신청을 받습니다.\n\n신청 기간: 2026.07.01 ~ 2026.07.31\n신청 방법: 홈페이지 장학회 메뉴 참고\n\n문의: 총동문회 사무국", authorId: admin.id },
      { title: "총동문회 홈페이지 오픈 안내", content: "총동문회 공식 홈페이지가 새롭게 오픈되었습니다.\n\n동문 여러분의 많은 이용 바랍니다.", authorId: admin.id },
      { title: "2026년 상반기 이사회 결과 공지", content: "2026년 상반기 이사회 결과를 공지합니다.\n\n주요 안건:\n1. 예산 심의 및 의결\n2. 장학금 수혜자 선정\n3. 하반기 행사 계획 승인", authorId: admin.id },
      { title: "동문 주소 변경 신청 안내", content: "주소 변경이 있으신 동문께서는 사무국으로 연락 주시기 바랍니다.", authorId: admin.id },
    ],
  });

  // 자유게시판
  const post1 = await prisma.post.create({
    data: {
      title: "오랜만에 모교 방문했습니다",
      content: "지난 주말 모교를 방문했습니다. 많이 바뀌었지만 추억이 새록새록 떠오르더군요. 다들 건강하게 잘 지내시죠?",
      authorId: admin.id,
    },
  });
  await prisma.comment.createMany({
    data: [
      { content: "저도 가고 싶네요! 좋은 추억 만드셨겠습니다.", authorId: admin.id, postId: post1.id },
      { content: "모교 사진도 공유해 주세요~", authorId: admin.id, postId: post1.id },
    ],
  });

  await prisma.post.create({
    data: {
      title: "동문 기업 채용 공고 공유",
      content: "동문 선배님이 운영하시는 회사에서 신입/경력 채용 중입니다.\n\n직종: 기계 설계 엔지니어\n경력: 3년 이상\n문의: 총동문회 사무국을 통해 연락 주세요.",
      authorId: admin.id,
    },
  });

  // 임원진
  await prisma.officer.createMany({
    skipDuplicates: true,
    data: [
      { name: "김유한", position: "총동문회장", graduationYear: 1985, order: 1 },
      { name: "이기술", position: "부회장", graduationYear: 1988, order: 2 },
      { name: "박연마", position: "사무국장", graduationYear: 1992, order: 3 },
      { name: "최봉사", position: "감사", graduationYear: 1990, order: 4 },
    ],
  });

  // 행사 일정
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "2026 정기 총동문회",
        description: "연례 정기 총동문회 행사입니다.",
        location: "유한공업고등학교 대강당",
        startDate: new Date("2026-10-15T14:00:00"),
        endDate: new Date("2026-10-15T17:00:00"),
        authorId: admin.id,
      },
      {
        title: "장학금 수여식",
        description: "2026학년도 장학금 수여식을 진행합니다.",
        location: "유한공업고등학교 회의실",
        startDate: new Date("2026-08-20T10:00:00"),
        endDate: new Date("2026-08-20T12:00:00"),
        authorId: admin.id,
      },
      {
        title: "동문 체육대회",
        description: "동문 간 친목 도모를 위한 체육대회입니다.",
        location: "유한공업고등학교 운동장",
        startDate: new Date("2026-09-05T09:00:00"),
        endDate: new Date("2026-09-05T18:00:00"),
        authorId: admin.id,
      },
    ],
  });

  // 갤러리
  const gallery1 = await prisma.galleryPost.create({
    data: {
      title: "2025 정기 총동문회 행사 사진",
      content: "지난 10월 개최된 2025년 정기 총동문회 행사 사진입니다.",
      authorId: admin.id,
    },
  });
  await prisma.galleryImage.createMany({
    data: [
      { url: "https://picsum.photos/seed/gallery1a/800/600", order: 0, postId: gallery1.id },
      { url: "https://picsum.photos/seed/gallery1b/800/600", order: 1, postId: gallery1.id },
    ],
  });

  const gallery2 = await prisma.galleryPost.create({
    data: {
      title: "2025 동문 체육대회",
      content: "동문 간 친목 도모를 위한 체육대회 현장입니다.",
      authorId: admin.id,
    },
  });
  await prisma.galleryImage.createMany({
    data: [
      { url: "https://picsum.photos/seed/gallery2a/800/600", order: 0, postId: gallery2.id },
      { url: "https://picsum.photos/seed/gallery2b/800/600", order: 1, postId: gallery2.id },
      { url: "https://picsum.photos/seed/gallery2c/800/600", order: 2, postId: gallery2.id },
    ],
  });

  // 장학회
  await prisma.scholarship.createMany({
    skipDuplicates: true,
    data: [
      { name: "유일한 장학금", amount: "연 200만원", period: "1년 (갱신 가능)", description: "성적 우수 및 가정 형편이 어려운 재학생 대상", order: 1 },
      { name: "동문 장학금", amount: "연 100만원", period: "1년", description: "동문 자녀 중 성적 우수자 대상", order: 2 },
    ],
  });

  // 동문 회원 (APPROVED + AlumniProfile)
  const alumniData = [
    { name: "홍길동", email: "hong@test.com", graduationYear: 1995, department: "기계과" },
    { name: "김철수", email: "kim@test.com", graduationYear: 1998, department: "전기과" },
    { name: "이영희", email: "lee@test.com", graduationYear: 2000, department: "전자과" },
    { name: "박민준", email: "park@test.com", graduationYear: 2003, department: "화학공업과" },
    { name: "최수진", email: "choi@test.com", graduationYear: 2005, department: "기계과" },
    { name: "정재원", email: "jung@test.com", graduationYear: 2008, department: "전기과" },
    { name: "강다은", email: "kang@test.com", graduationYear: 2010, department: "전자과" },
  ];

  for (const alumni of alumniData) {
    const user = await prisma.user.upsert({
      where: { email: alumni.email },
      update: {},
      create: { name: alumni.name, email: alumni.email, status: "APPROVED" },
    });
    await prisma.alumniProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, graduationYear: alumni.graduationYear, department: alumni.department },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
