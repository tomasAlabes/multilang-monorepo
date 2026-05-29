package_json()

docker_image(
    name="image",
    source="Dockerfile",
    repository="dashboard",
    # Next.js build runs in the image (pnpm install + next build); //:js-src
    # stages the pnpm workspace source into the build context.
    dependencies=["//:js-src"],
)

javascript_sources(
    name="dashboard0",
)

typescript_sources(
    name="dashboard1",
)
