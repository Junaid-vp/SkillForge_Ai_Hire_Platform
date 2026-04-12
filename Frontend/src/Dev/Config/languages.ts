// src/Config/languages.ts

export const LANGUAGES = [
  // ── Web ──────────────────────────────
  { id: 63,  name: "JavaScript",  monacoLang: "javascript",  category: "Web"      },
  { id: 74,  name: "TypeScript",  monacoLang: "typescript",  category: "Web"      },
  { id: 68,  name: "PHP",         monacoLang: "php",         category: "Web"      },

  // ── Backend ──────────────────────────
  { id: 71,  name: "Python",      monacoLang: "python",      category: "Backend"  },
  { id: 62,  name: "Java",        monacoLang: "java",        category: "Backend"  },
  { id: 54,  name: "C++",         monacoLang: "cpp",         category: "Backend"  },
  { id: 50,  name: "C",           monacoLang: "c",           category: "Backend"  },
  { id: 51,  name: "C#",          monacoLang: "csharp",      category: "Backend"  },
  { id: 72,  name: "Ruby",        monacoLang: "ruby",        category: "Backend"  },
  { id: 73,  name: "Rust",        monacoLang: "rust",        category: "Backend"  },
  { id: 60,  name: "Go",          monacoLang: "go",          category: "Backend"  },
  { id: 78,  name: "Kotlin",      monacoLang: "kotlin",      category: "Backend"  },
  { id: 83,  name: "Swift",       monacoLang: "swift",       category: "Backend"  },
  { id: 85,  name: "Perl",        monacoLang: "perl",        category: "Backend"  },
  { id: 56,  name: "Scala",       monacoLang: "scala",       category: "Backend"  },

  // ── Database ─────────────────────────
  { id: 82,  name: "SQL",         monacoLang: "sql",         category: "Database" },
  { id: 87,  name: "MySQL",       monacoLang: "sql",         category: "Database" },
  { id: 88,  name: "PostgreSQL",  monacoLang: "pgsql",       category: "Database" },

  // ── Scripting ────────────────────────
  { id: 70,  name: "Python 2",    monacoLang: "python",      category: "Scripting"},
  { id: 69,  name: "Haskell",     monacoLang: "haskell",     category: "Scripting"},
  { id: 67,  name: "Erlang",      monacoLang: "plaintext",   category: "Scripting"},
  { id: 59,  name: "Bash",        monacoLang: "shell",       category: "Scripting"},
  { id: 79,  name: "Objective-C", monacoLang: "objective-c", category: "Scripting"},
  { id: 64,  name: "Lua",         monacoLang: "lua",         category: "Scripting"},
]

// ── Default code per language ─────────────────────────────────────────────────

export const DEFAULT_CODE: Record<string, string> = {

  // ── JavaScript ──────────────────────
  javascript: `// JavaScript Solution
function solution(nums) {
  // Write your solution here
  
  return result;
}

console.log(solution([1, 2, 3]));`,

  // ── TypeScript ──────────────────────
  typescript: `// TypeScript Solution
function solution(nums: number[]): number {
  // Write your solution here
  
  return result;
}

console.log(solution([1, 2, 3]));`,

  // ── Python ──────────────────────────
  python: `# Python Solution
def solution(nums):
    # Write your solution here
    
    return result

print(solution([1, 2, 3]))`,

  // ── Java ────────────────────────────
  java: `import java.util.*;
import java.util.stream.*;

public class Solution {
    
    public static int solution(int[] nums) {
        // Write your solution here
        
        return 0;
    }
    
    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(solution(nums));
    }
}`,

  // ── C++ ─────────────────────────────
  cpp: `#include <bits/stdc++.h>
using namespace std;

int solution(vector<int>& nums) {
    // Write your solution here
    
    return 0;
}

int main() {
    vector<int> nums = {1, 2, 3};
    cout << solution(nums) << endl;
    return 0;
}`,

  // ── C ───────────────────────────────
  c: `#include <stdio.h>
#include <stdlib.h>

int solution(int* nums, int size) {
    // Write your solution here
    
    return 0;
}

int main() {
    int nums[] = {1, 2, 3};
    int size = sizeof(nums) / sizeof(nums[0]);
    printf("%d\\n", solution(nums, size));
    return 0;
}`,

  // ── C# ──────────────────────────────
  csharp: `using System;
using System.Collections.Generic;
using System.Linq;

public class Solution {
    
    public static int Method(int[] nums) {
        // Write your solution here
        
        return 0;
    }
    
    public static void Main(string[] args) {
        int[] nums = {1, 2, 3};
        Console.WriteLine(Method(nums));
    }
}`,

  // ── Go ──────────────────────────────
  go: `package main

import "fmt"

func solution(nums []int) int {
    // Write your solution here
    
    return 0
}

func main() {
    nums := []int{1, 2, 3}
    fmt.Println(solution(nums))
}`,

  // ── Rust ────────────────────────────
  rust: `fn solution(nums: Vec<i32>) -> i32 {
    // Write your solution here
    
    0
}

fn main() {
    let nums = vec![1, 2, 3];
    println!("{}", solution(nums));
}`,

  // ── Ruby ────────────────────────────
  ruby: `# Ruby Solution
def solution(nums)
  # Write your solution here
  
  result
end

puts solution([1, 2, 3])`,

  // ── Kotlin ──────────────────────────
  kotlin: `fun solution(nums: IntArray): Int {
    // Write your solution here
    
    return 0
}

fun main() {
    val nums = intArrayOf(1, 2, 3)
    println(solution(nums))
}`,

  // ── Swift ───────────────────────────
  swift: `import Foundation

func solution(_ nums: [Int]) -> Int {
    // Write your solution here
    
    return 0
}

let nums = [1, 2, 3]
print(solution(nums))`,

  // ── PHP ─────────────────────────────
  php: `<?php

function solution(array $nums): int {
    // Write your solution here
    
    return 0;
}

$nums = [1, 2, 3];
echo solution($nums) . "\\n";`,

  // ── Scala ───────────────────────────
  scala: `object Solution {
  
  def solution(nums: Array[Int]): Int = {
    // Write your solution here
    
    0
  }
  
  def main(args: Array[String]): Unit = {
    val nums = Array(1, 2, 3)
    println(solution(nums))
  }
}`,

  // ── SQL ─────────────────────────────
  sql: `-- SQL Solution
-- Write your query here

SELECT *
FROM table_name
WHERE condition
ORDER BY column_name;`,

  // ── MySQL ───────────────────────────
  mysql: `-- MySQL Solution
-- Write your query here

SELECT 
    column1,
    column2,
    COUNT(*) as count
FROM table_name
WHERE condition = 'value'
GROUP BY column1
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 10;`,

  // ── PostgreSQL ───────────────────────
  pgsql: `-- PostgreSQL Solution
-- Write your query here

SELECT 
    t1.column1,
    t2.column2,
    COUNT(*) as total
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.table1_id
WHERE t1.status = 'active'
GROUP BY t1.column1, t2.column2
HAVING COUNT(*) > 0
ORDER BY total DESC;`,

  // ── Bash ────────────────────────────
  shell: `#!/bin/bash
# Bash Solution

# Write your solution here
nums=(1 2 3)

for num in "\${nums[@]}"; do
  echo $num
done`,

  // ── Lua ─────────────────────────────
  lua: `-- Lua Solution
function solution(nums)
    -- Write your solution here
    
    return 0
end

local nums = {1, 2, 3}
print(solution(nums))`,

  // ── Haskell ─────────────────────────
  haskell: `-- Haskell Solution
module Main where

solution :: [Int] -> Int
solution nums = 
    -- Write your solution here
    0

main :: IO ()
main = do
    let nums = [1, 2, 3]
    print (solution nums)`,

  // ── Perl ────────────────────────────
  perl: `#!/usr/bin/perl
use strict;
use warnings;

sub solution {
    my @nums = @_;
    # Write your solution here
    
    return 0;
}

my @nums = (1, 2, 3);
print solution(@nums) . "\\n";`,
}

// ── Category colors for UI ────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  Web:       "bg-blue-100 text-blue-600",
  Backend:   "bg-purple-100 text-purple-600",
  Database:  "bg-green-100 text-green-600",
  Scripting: "bg-orange-100 text-orange-600",
}

// ── Helper: get languages by category ────────────────────────────────────────

export const getLanguagesByCategory = () => {
  const categories: Record<string, typeof LANGUAGES> = {}

  LANGUAGES.forEach(lang => {
    if (!categories[lang.category]) {
      categories[lang.category] = []
    }
    categories[lang.category].push(lang)
  })

  return categories
}