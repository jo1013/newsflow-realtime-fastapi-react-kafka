// SearchPage.js
import React, { useState, useEffect } from 'react';
import { Grid, TextField, Box, Typography } from '@mui/material';
import NewsCard from '../components/NewsCard';

function SearchPage({ newsData }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        // 초기 렌더링 시 전체 뉴스 데이터를 표시
        setFilteredData(newsData);
    }, [newsData]);  // newsData가 변경되면 반응

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        if (query) {
            const filtered = newsData.filter(news =>
                (news.title && news.title.toLowerCase().includes(query)) ||
                (news.description && news.description.toLowerCase().includes(query))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(newsData);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search News"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
            />
            <Grid container spacing={4} sx={{ marginTop: 2 }}>
                {filteredData.length > 0 ? (
                    filteredData.map(news => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={news._id}>
                            <NewsCard
                                id={news._id}
                                title={news.title}
                                imageUrl={news.image}
                                source={news.source}
                                published_at={news.published_at}
                            />
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ marginTop: 2 }} variant="subtitle1">No results found for your search.</Typography>
                )}
            </Grid>
        </Box>
    );
}

export default SearchPage;
