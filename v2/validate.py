#!/usr/bin/env python3
"""Validate independent v2 data. Run: python3 v2/validate.py"""
from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
problems = []

def read_json(filename: str):
    try:
        with (ROOT / filename).open(encoding="utf-8") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        problems.append(f"{filename}: {exc}")
        return {}

entries_doc = read_json("data/entries.json")
roots_doc = read_json("roots-map.json")
idioms_doc = read_json("idioms.json")
entries = entries_doc.get("entries", [])
root_map = roots_doc.get("roots", {})
idioms = idioms_doc.get("items", [])

if not isinstance(entries, list):
    problems.append("entries must be an array")
    entries = []
if not isinstance(root_map, dict):
    problems.append("roots must be a mapping")
    root_map = {}
if not isinstance(idioms, list):
    problems.append("idioms must be an array")
    idioms = []

ids = set()
for position, entry in enumerate(entries, 1):
    prefix = f"entry {position}"
    if not isinstance(entry, dict):
        problems.append(f"{prefix}: expected an object")
        continue
    word_id = entry.get("id")
    word = entry.get("word")
    if not isinstance(word_id, str) or not word_id.strip():
        problems.append(f"{prefix}: missing id")
        continue
    if word_id in ids:
        problems.append(f"{prefix}: duplicate id {word_id}")
    ids.add(word_id)
    if not isinstance(word, str) or not word.strip():
        problems.append(f"{prefix}: missing word")
    for key in ("pos", "ipa", "meaning", "etymology", "core"):
        if not isinstance(entry.get(key), str):
            problems.append(f"{prefix} ({word_id}): {key} is not a string")
    for key in ("difficulty", "daily", "business"):
        score = entry.get(key)
        if isinstance(score, bool) or not isinstance(score, int) or not 1 <= score <= 5:
            problems.append(f"{prefix} ({word_id}): {key} must be 1..5")
    examples = entry.get("examples", [])
    if not isinstance(examples, list):
        problems.append(f"{prefix} ({word_id}): examples must be a list")
    else:
        for j, example in enumerate(examples, 1):
            if not (isinstance(example, list) and len(example) == 2 and
                    all(isinstance(value, str) for value in example)):
                problems.append(f"{prefix} ({word_id}): example {j} must be [English, Japanese]")
    for key in ("related", "synonyms", "reference"):
        relatives = entry.get(key, [])
        if not isinstance(relatives, list):
            problems.append(f"{prefix} ({word_id}): {key} must be a list")
        else:
            for j, relative in enumerate(relatives, 1):
                if not (isinstance(relative, dict) and isinstance(relative.get("word"), str)
                        and relative.get("word").strip()):
                    problems.append(f"{prefix} ({word_id}): invalid {key} {j}")

missing_roots = ids - set(root_map)
orphan_roots = set(root_map) - ids
if missing_roots:
    problems.append("Missing roots for: " + ", ".join(sorted(missing_roots)))
if orphan_roots:
    problems.append("Orphan roots: " + ", ".join(sorted(orphan_roots)))
for word_id, pair in root_map.items():
    if not (isinstance(pair, list) and len(pair) == 2 and all(isinstance(s, str) and s for s in pair)):
        problems.append(f"roots[{word_id}]: expected [root, origin]")
for position, idiom in enumerate(idioms, 1):
    if not (isinstance(idiom, list) and len(idiom) == 7 and all(isinstance(s, str) for s in idiom)):
        problems.append(f"idiom {position}: expected seven text columns")

if problems:
    for problem in problems:
        print("FAIL:", problem)
    sys.exit(1)

print(f"OK: {len(entries)} headwords, {len(set(pair[0] for pair in root_map.values()))} roots, "
      f"{len(idioms)} standalone idioms. All references and data types valid.")
