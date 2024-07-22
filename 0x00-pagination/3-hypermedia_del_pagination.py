#!/usr/bin/env python3
"""
Deletion-resilient hypermedia pagination
"""

import csv
import math
from typing import List, Dict, Union, Tuple


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None
        self.__indexed_dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def indexed_dataset(self) -> Dict[int, List]:
        """Dataset indexed by sorting position, starting at 0
        """
        if self.__indexed_dataset is None:
            dataset = self.dataset()
            truncated_dataset = dataset[:1000]
            self.__indexed_dataset = {
                i: dataset[i] for i in range(len(dataset))
            }
        return self.__indexed_dataset

    def get_page(self, index: Union[int, None] = None,
                 page_size: int = 10) -> Tuple[int, List[List]]:
        '''return a page from the dataset and last index'''
        indexed_data = self.indexed_dataset()
        assert isinstance(index, int) and index <= len(indexed_data) - 1\
            and index >= 0
        count = 0
        data = []
        while count < page_size:
            if index >= len(indexed_data):
                break
            tmp = indexed_data.get(index)
            if tmp:
                data.append(tmp)
                count += 1
            index += 1
        return index, data

    def get_hyper_index(self, index: Union[int, None] = None,
                        page_size: int = 10) -> Dict:
        '''return delete resilient hypermedia object'''
        indexed_data = self.indexed_dataset()
        last_index, data = self.get_page(index, page_size)
        next_index = last_index
        return {
            'index': index,
            'data': data,
            'next_index': next_index,
            'page_size': len(data)
        }
