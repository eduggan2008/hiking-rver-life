import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  TextAreaField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    setBlogs();
  }, []);

  async function fetchBlogs() {
    const { data: blogs } = await client.models.Blog.list();
    await Promise.all(
      blogs.map(async (blog) => {
        if (blog.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${blog.image}`,
          });
          console.log(linkToStorageFile.url);
          blog.image = linkToStorageFile.url;
        }
        return blog;
      })
    );
    console.log(blogs);
    setBlogs(blogs);
  }

  async function createBlog(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    console.log(form.get("image").name);

    const { data: newBlog } = await client.models.Blog.create({
      title: form.get("title"),
      subtitle: form.get("subtitle"),
      content: form.get("content"),
      image: form.get("image").name,
      /* date: form.get("date"),
      timestamp: form.get("timestamp"), */
    });

    console.log(newBlog);
    if (newBlog.image)
      if (newBlog.image)
        await uploadData({
          path: ({ identityId }) => `media/${identityId}/${newBlog.image}`,

          data: form.get("image"),
        }).result;

    fetchBlogs();
    event.target.reset();
  }

  async function deleteBlog({ id }) {
    const toBeDeletedBlog = {
      id: id,
    };

    const { data: deletedBlog } = await client.models.Blog.delete(
      toBeDeletedBlog
    );
    console.log(deletedBlog);

    fetchBlogs();
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>Hiking RVer Life</Heading>
          <View as="form" margin="3rem 0" onSubmit={createBlog}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="2rem"
              padding="2rem"
            >
              <TextField
                name="title"
                placeholder="Title"
                label="Title"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="subtitle"
                placeholder="Subtitle"
                label="Subtitle"
                labelHidden
                variation="quiet"
                required
              />
              <TextAreaField
                name="content"
                placeholder="Content"
                label="Content"
                labelHidden
                variation="quiet"
                required
                rows={5}
              />
              {/* <TextField
                name="date"
                placeholder="Date"
                type="date"
                label="Date"
                labelHidden
              /> */}
              {/* <TextField
                name="timestamp"
                placeholder="Timestamp"
                type="timestamp"
                label="DatTimestampe"
                labelHidden
              /> */}
              <View
                name="image"
                as="input"
                type="file"
                alignSelf={"end"}
                accept="image/png, image/jpeg"
              />

              <Button type="submit" variation="primary">
                Create Blog
              </Button>
            </Flex>
          </View>
          <Divider />
          <Heading level={2}>Current Blogs</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {blogs && blogs.map((blog) => (
              <Flex
                key={blog.id || blog.title}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{blog.title}</Heading>
                </View>
                <Text>{blog.subtitle}</Text>
                <Text fontStyle="italic">{blog.content}</Text>
                {blog.image && (
                  <Image
                    src={blog.image}
                    alt={`visual aid for ${blogs.title}`}
                    style={{ width: 400 }}
                  />
                )}
                <Button
                  variation="destructive"
                  onClick={() => deleteBlog(blog)}
                >
                  Delete Blog
                </Button>
              </Flex>
            ))}
          </Grid>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}




/* import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Hiking RVer Life</h1>
      <h2>Adventures</h2>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App */
