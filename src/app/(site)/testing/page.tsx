import markdownIt from 'markdown-it';

export default function Testing() {
  const md = new markdownIt();
  const result = md.render('# Hello World');

  return (
    <div>
      <h1>{result}</h1>
    </div>
  );
}