#!/usr/bin/env python3
'''2. Hypermedia pagination'''
import csv
import math
from typing import List, Tuple, Dict, Union


def index_range(page: int, page_size: int) -> Tuple[int, int]:
    '''return a tuple of size two containing a start index and an end index'''
    end_index: int = page * page_size
    start_index: int = 0 if page == 1 else end_index - page_size
    return (start_index, end_index)


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def get_page(self, page: int = 1, page_size: int = 10) -> List[List]:
        '''
        return the correct pages using page and page_size
        '''
        data = self.dataset()
        assert isinstance(page, int) and page > 0
        assert isinstance(page_size, int) and page_size > 0
        start, end = index_range(page, page_size)
        if data is None or end > len(data) - 1:
            return []
        return data[start:end]

    def get_hyper(self, page: int = 1, page_size: int = 10) -> Dict:
        data = self.get_page(page, page_size)
        dataset = self.dataset()
        total_pages = math.ceil(len(dataset) / page_size)
        next_page = page + 1 if page < total_pages else None
        prev_page = page - 1 if page - 1 > 1 else None
        return {
            'page_size': len(data),
            'page': page,
            'data': data,
            'next_page': next_page,
            'prev_page': prev_page,
            'total_pages': total_pages
        }
