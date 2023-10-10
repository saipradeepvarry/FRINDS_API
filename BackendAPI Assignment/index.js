const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

app.use(express.json());

// Users
app.get("/users", async (req, res) => {
	const users = await prisma.user.findMany();
	res.json(users);
});

app.post("/users", async (req, res) => {
	const { name, email, password } = req.body;
	let newUser;
	try {
		newUser = await prisma.user.create({
			data: {
				name,
				email,
				password,
			},
		});
		res.json(newUser);
	} catch (error) {
		res.status(500).json({ message: "Error creating user" });
	}
});

// Blogs
app.get("/blogs", async (req, res) => {
	const blogs = await prisma.blog.findMany();
	res.json(blogs);
});

app.post("/blogs", async (req, res) => {
	const { title, content, authorId } = req.body;
	let newBlog;
	try {
		newBlog = await prisma.blog.create({
			data: {
				title,
				content,
				author: {
					connect: { id: authorId },
				},
			},
		});
		res.json(newBlog);
	} catch (error) {
		res.status(500).json({ message: "Error creating blog" });
	}
});

// Comments
app.get("/comments", async (req, res) => {
	const comments = await prisma.comment.findMany();
	res.json(comments);
});

app.post("/comments", async (req, res) => {
	const { content, authorId, blogId } = req.body;
	let newComment;
	try {
		newComment = await prisma.comment.create({
			data: {
				content,
				author: {
					connect: { id: authorId },
				},
				blog: {
					connect: { id: blogId },
				},
			},
		});
		res.json(newComment);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Error creating comment" });
	}
});

app.get("/users/:userId/friends/:level", async (req, res) => {
	try {
		const userId = parseInt(req.params.userId);
		const level = parseInt(req.params.level);

		// First, get all the blogs and their comments
		const blogs = await prisma.blog.findMany({
			include: {
				comments: {
					include: {
						author: true,
					},
				},
			},
		});

		// Then, find all the 1st level friends of the given user
		const userComments = blogs
			.flatMap((blog) => blog.comments)
			.filter((comment) => comment.authorId === userId);
		const firstLevelFriendIds = Array.from(
			new Set(userComments.map((comment) => comment.author.id))
		);

		if (level === 1) {
			// If level is 1, return the first level friends
			const firstLevelFriends = await prisma.user.findMany({
				where: {
					id: {
						in: firstLevelFriendIds,
					},
				},
			});
			res.json(firstLevelFriends);
		} else {
			// If level is greater than 1, recursively find the friends of the previous level friends
			let friendIds = firstLevelFriendIds;
			let levelFriends = [];
			for (let i = 2; i <= level; i++) {
				// Find all the blogs that have comments from the current level's friends
				const levelFriendComments = blogs
					.flatMap((blog) => blog.comments)
					.filter((comment) => friendIds.includes(comment.authorId));
				const blogIds = Array.from(
					new Set(
						levelFriendComments.map((comment) => comment.blogId)
					)
				);

				// Find all the users who have commented on the same blogs as the current level's friends,
				// but are not already friends at a lower level
				const potentialFriends = await prisma.user.findMany({
					where: {
						comments: {
							some: {
								blogId: {
									in: blogIds,
								},
								authorId: {
									notIn: friendIds,
								},
							},
						},
					},
				});

				// Filter out duplicate potential friends
				const newFriendIds = Array.from(
					new Set(potentialFriends.map((friend) => friend.id))
				);

				// If there are no new friends at this level, we can stop searching
				if (newFriendIds.length === 0) {
					break;
				}

				// Add the new friend IDs to the overall list of friend IDs
				friendIds = friendIds.concat(newFriendIds);

				// Get the friend objects for the new friend IDs
				const levelFriendObjects = await prisma.user.findMany({
					where: {
						id: {
							in: newFriendIds,
						},
					},
				});
				levelFriends = levelFriends.concat(levelFriendObjects);
			}

			res.json(levelFriends);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Start server
app.listen(process.env.PORT || 5001, () => {
	console.log("Server is running on port 5001");
});
