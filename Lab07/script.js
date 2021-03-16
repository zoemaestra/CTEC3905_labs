"use strict";

let pageSize = 12;
let currentPage;
let objectIDs;

async function loadObject(id) {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
  const response = await fetch(url);
  return response.json();
}

loadObject(10000).then(obj => console.log(obj))

function buildArticleFromData(obj) {
  const article = document.createElement("article");
  const title = document.createElement("h2");
  const primaryImageSmall = document.createElement("img");
  const objectInfo = document.createElement("p");
  const objectName = document.createElement("span");
  const objectDate = document.createElement("span");
  const medium = document.createElement("p");

  title.textContent = obj.title;
  primaryImageSmall.src = obj.primaryImageSmall;
  primaryImageSmall.alt = obj.title;
  objectName.textContent = obj.objectName;
  objectDate.textContent = `, ${obj.objectDate}`;
  medium.textContent = obj.medium;

  article.appendChild(title);
  article.appendChild(primaryImageSmall);
  article.appendChild(objectInfo);
  article.appendChild(medium);

  objectInfo.appendChild(objectName);
  if(obj.objectDate) {
    objectInfo.appendChild(objectDate);
  }

  return article;
}

async function insertArticles(objIds) {
  objects = await Promise.all(objIds.map(loadObject))
  articles = objects.map(buildArticleFromData);
  articles.forEach(a => results.appendChild(a));
}

async function loadSearch(query) {
  let baseURL = `https://collectionapi.metmuseum.org/public/collection/v1/search`;
  const response = await fetch(`${baseURL}?hasImages=true&q=${query}`);
  return response.json();
}

function clearResults() {
  while(results.firstChild) {
    results.firstChild.remove();
  }
}

async function doSearch(ev) {
  clearResults();
  loader.classList.add("waiting");
  const result = await loadSearch(query.value);
  objectIDs = result.objectIDs;
  count.textContent = `found ${objectIDs.length} results for "${query.value}"`;
  nPages.textContent = Math.ceil(objectIDs.length / pageSize);
  currentPage = 1;
  loadPage(currentPage);
}

async function loadPage() {
	clearResults();
	const myObjects = objectIDs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	loader.classList.add("waiting");
	await insertArticles(myObjects);
	loader.classList.remove("waiting");
  pageIndicator.textContent = currentPage;
}

function nextPage() {
  currentPage += 1;
  const nPages = Math.ceil(objectIDs.length / pageSize);
  if(currentPage > nPages) { currentPage = 1;}
  loadPage();
}

function prevPage() {
  currentPage -= 1;
  const nPages = Math.ceil(objectIDs.length / pageSize);
  if(currentPage < 1) { currentPage = nPages;}
  loadPage();
}

query.addEventListener('change', doSearch);
prev.addEventListener('click', prevPage);
next.addEventListener('click', nextPage);
