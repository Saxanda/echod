const test = require("node:test");
const assert = require("node:assert/strict");

require("ts-node/register/transpile-only");

const { PostModel } = require("../src/models/Post");
const { FollowModel } = require("../src/models/Follow");
const { PostService } = require("../src/services/postService");

test("PostService.create creates a post and notifies followers", async (t) => {
    const originalCreate = PostModel.create;
    const originalFind = FollowModel.find;

    const createdPost = {
        text: "hello world",
        author: "author-1",
        image: "",
        populateCalls: [],
        async populate(path, fields) {
            this.populateCalls.push([path, fields]);
            return {
                id: "post-1",
                text: this.text,
                author: { id: this.author, username: "author" },
                image: this.image,
            };
        },
    };

    const createCalls = [];
    const notifyCalls = [];

    PostModel.create = async (payload) => {
        createCalls.push(payload);
        return createdPost;
    };

    FollowModel.find = (query) => {
        assert.deepEqual(query, { following: "author-1" });
        return {
            lean: async () => [
                { follower: "follower-1" },
                { follower: "follower-2" },
            ],
        };
    };

    t.after(() => {
        PostModel.create = originalCreate;
        FollowModel.find = originalFind;
    });

    const service = new PostService({
        notifyFollowers(followerIds, post) {
            notifyCalls.push({ followerIds, post });
        },
    });

    const result = await service.create("author-1", "hello world");

    assert.deepEqual(createCalls, [
        {
            text: "hello world",
            author: "author-1",
            image: "",
        },
    ]);
    assert.deepEqual(createdPost.populateCalls, [
        ["author", "username displayName avatar"],
    ]);
    assert.deepEqual(notifyCalls, [
        {
            followerIds: ["follower-1", "follower-2"],
            post: result,
        },
    ]);
    assert.deepEqual(result, {
        id: "post-1",
        text: "hello world",
        author: { id: "author-1", username: "author" },
        image: "",
    });
});
