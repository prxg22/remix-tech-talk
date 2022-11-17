export const createMDErrorResponse = (
  err: any,
  slug: string,
  title: string,
) => {
  if (err.code === 'ENOENT' && err.syscall === 'open') {
    err.statusCode = 404
  }

  if (slug) {
    const file = {
      slug,
      title,
    }

    err.file = file
  }

  return new Response(JSON.stringify(err), {
    statusText: err.message,
    status: err.statusCode ?? 400,
  })
}
