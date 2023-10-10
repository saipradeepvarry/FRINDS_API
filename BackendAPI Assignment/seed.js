const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
	await prisma.comment.deleteMany();
	await prisma.blog.deleteMany();
	await prisma.user.deleteMany();

	// Create Users
	let users = [
		{
			name: "John Doe",
			email: "john@example.com",
			password: "passwordJohn",
		},
		{
			name: "Jane Doe",
			email: "jane@example.com",
			password: "passwordJane",
		},
		{
			name: "Bob Smith",
			email: "bob@example.com",
			password: "passwordBob",
		},
		{
			name: "Alice Smith",
			email: "alice@xyz.com",
			password: "passwordAlice",
		},
	];

	for (let user of users) {
		await prisma.user.create({
			data: user,
		});
	}

	// Create Blogs
	users = await prisma.user.findMany();

	let blogs = [
		{
			title: "First Blog",
			content: "This is my first blog post",
			author: { connect: { id: users[0].id } },
		},
		{
			title: "Second Blog",
			content: "This is my second blog post",
			author: { connect: { id: users[1].id } },
		},
		{
			title: "Third Blog",
			content: "This is my third blog post",
			author: { connect: { id: users[2].id } },
		},
	];

	for (let blog of blogs) {
		await prisma.blog.create({
			data: blog,
		});
	}

	// Create Comments
	blogs = await prisma.blog.findMany();
	const comment1 = await prisma.comment.create({
		data: {
			content: "This is a great post!",
			author: {
				connect: { id: users[0].id }, // connect the comment with user id 1
			},
			blog: {
				connect: { id: blogs[0].id }, // connect the comment with blog id 1
			},
		},
	});

	const comment2 = await prisma.comment.create({
		data: {
			content: "I disagree with some points in this post",
			author: {
				connect: { id: users[1].id }, // connect the comment with user id 2
			},
			blog: {
				connect: { id: blogs[0].id }, // connect the comment with blog id 1
			},
		},
	});

	const comment3 = await prisma.comment.create({
		data: {
			content: "Thanks for sharing this useful information!",
			author: {
				connect: { id: users[2].id }, // connect the comment with user id 3
			},
			blog: {
				connect: { id: blogs[1].id }, // connect the comment with blog id 2
			},
		},
	});

	const comment4 = await prisma.comment.create({
		data: {
			content: "I had a similar experience with this issue",
			author: {
				connect: { id: users[3].id }, // connect the comment with user id 4
			},
			blog: {
				connect: { id: blogs[1].id }, // connect the comment with blog id 2
			},
		},
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
