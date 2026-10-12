# Example 1: Squaring numbers
numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# Example 2: Filtering even numbers
evens = [n for n in numbers if n % 2 == 0]
print(evens)  # [2, 4]

# Example 3: Cleaning strings
raw_tags = ["  python ", "FASTAPI", "  sql  "]
clean_tags = [tag.strip().lower() for tag in raw_tags]
print(clean_tags)  # ['python', 'fastapi', 'sql']

# Example 4: Inline ternary conditional inside comprehension
labels = ["Even" if n % 2 == 0 else "Odd" for n in numbers]
print(labels)  # ['Odd', 'Even', 'Odd', 'Even', 'Odd']


# Interview question: Given a list of file names, return a list containing only the .csv files converted to lowercase.
def get_csv_files(filenames: list[str]) -> list[str]:
    return [name.lower() for name in filenames if name.lower().endswith(".csv")]

# Test cases
files = ["data.CSV", "report.pdf", "users.csv", "image.png"]
print(get_csv_files(files))  # ['data.csv', 'users.csv']
print("Filter CSV files passed!")  # Filter CSV files passed!

