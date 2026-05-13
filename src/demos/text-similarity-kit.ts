import { arrayToHtmlTable } from 'array-table-kit';
import { compareStrings, isSimilar, rankMatches } from 'text-similarity-kit';
import type { SimilarityAlgorithm } from 'text-similarity-kit';
import { textCandidatesSample } from '../sample-data';
import { byId, escapeHtml, renderError } from '../shared';

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="text-similarity-query">Query</label>
      <input id="text-similarity-query" value="export invoice" />
      <label for="text-similarity-candidates">Candidates</label>
      <textarea id="text-similarity-candidates" spellcheck="false">${escapeHtml(textCandidatesSample.join('\n'))}</textarea>
      <div class="control-row">
        <label for="text-similarity-algorithm">Algorithm</label>
        <select id="text-similarity-algorithm">
          <option value="dice">dice</option>
          <option value="levenshtein">levenshtein</option>
          <option value="jaro">jaro</option>
          <option value="jaro-winkler" selected>jaro-winkler</option>
        </select>
      </div>
      <div class="control-row">
        <label for="text-similarity-threshold">Threshold</label>
        <div class="range-control">
          <input id="text-similarity-threshold" type="range" min="0" max="1" step="0.05" value="0.25" />
          <output id="text-similarity-threshold-value" for="text-similarity-threshold">0.25</output>
        </div>
      </div>
      <div class="control-row">
        <label for="text-similarity-limit">Limit</label>
        <select id="text-similarity-limit">
          <option value="0">all matches</option>
          <option value="3" selected>3 matches</option>
          <option value="5">5 matches</option>
        </select>
      </div>
      <label class="check-control">
        <input id="text-similarity-diacritics" type="checkbox" />
        <span>Strip diacritics</span>
      </label>
    </div>
    <div class="panel output-panel">
      <div class="panel-title">Ranked matches</div>
      <div id="text-similarity-score" class="demo-meta"></div>
      <div id="text-similarity-output" class="table-output"></div>
    </div>
  `;
}

export function bindDemo(): void {
  const query = byId<HTMLInputElement>('text-similarity-query');
  const candidates = byId<HTMLTextAreaElement>('text-similarity-candidates');
  const algorithm = byId<HTMLSelectElement>('text-similarity-algorithm');
  const threshold = byId<HTMLInputElement>('text-similarity-threshold');
  const thresholdValue = byId<HTMLOutputElement>('text-similarity-threshold-value');
  const limit = byId<HTMLSelectElement>('text-similarity-limit');
  const stripDiacritics = byId<HTMLInputElement>('text-similarity-diacritics');
  const score = byId<HTMLDivElement>('text-similarity-score');
  const output = byId<HTMLDivElement>('text-similarity-output');

  const update = (): void => {
    const candidateList = candidates.value
      .split('\n')
      .map((candidate) => candidate.trim())
      .filter(Boolean);
    const selectedAlgorithm = algorithm.value as SimilarityAlgorithm;
    const thresholdNumber = Number(threshold.value);
    const limitNumber = Number(limit.value);

    thresholdValue.value = threshold.value;
    thresholdValue.textContent = thresholdNumber.toFixed(2);

    const rankOptions = {
      algorithm: selectedAlgorithm,
      threshold: thresholdNumber,
      stripDiacritics: stripDiacritics.checked
    };

    const matches = rankMatches(query.value, candidateList, limitNumber === 0
      ? rankOptions
      : { ...rankOptions, limit: limitNumber }).map((match) => ({
      candidate: match.candidate,
      rating: match.rating.toFixed(3),
      index: match.index
    }));

    const selfScore = compareStrings(query.value, candidateList[0] ?? '', {
      algorithm: selectedAlgorithm,
      stripDiacritics: stripDiacritics.checked
    });
    const passesThreshold = isSimilar(query.value, candidateList[0] ?? '', {
      algorithm: selectedAlgorithm,
      stripDiacritics: stripDiacritics.checked,
      threshold: thresholdNumber
    });

    score.textContent = `${candidateList.length} candidates · query vs first candidate: ${selfScore.toFixed(3)} · threshold pass: ${passesThreshold ? 'yes' : 'no'}`;
    output.innerHTML = matches.length > 0
      ? arrayToHtmlTable(matches, { columns: ['candidate', 'rating', 'index'] })
      : renderError('No match above the current threshold.');
  };

  query.addEventListener('input', update);
  candidates.addEventListener('input', update);
  algorithm.addEventListener('change', update);
  threshold.addEventListener('input', update);
  limit.addEventListener('change', update);
  stripDiacritics.addEventListener('change', update);
  update();
}
